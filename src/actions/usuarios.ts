"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { usuarios } from "@/db/schema";
import { getSessao, hashSenha, verificarSenha } from "@/lib/auth";
import { logInfo, logWarn, logError } from "@/lib/log-context";

export type Papel = "admin" | "editor";

export interface UsuarioDTO {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  criadoEm: Date;
}

type Resultado = { ok: boolean; erro?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function listarUsuarios(): Promise<UsuarioDTO[]> {
  if (!(await getSessao())) return [];
  const rows = await db
    .select({ id: usuarios.id, nome: usuarios.nome, email: usuarios.email, papel: usuarios.papel, criadoEm: usuarios.criadoEm })
    .from(usuarios)
    .orderBy(usuarios.criadoEm);
  return rows;
}

export async function criarUsuario(input: {
  nome: string; email: string; senha: string; papel: Papel;
}): Promise<Resultado> {
  const sessao = await getSessao();
  if (!sessao) return { ok: false, erro: "Não autenticado" };
  if (sessao.papel !== "admin") return { ok: false, erro: "Apenas administradores podem criar usuários" };

  const nome = (input.nome ?? "").trim();
  const email = (input.email ?? "").trim().toLowerCase();
  const senha = input.senha ?? "";
  const papel: Papel = input.papel === "admin" ? "admin" : "editor";

  if (nome.length < 2) return { ok: false, erro: "Informe o nome completo" };
  if (!EMAIL_RE.test(email)) return { ok: false, erro: "E-mail inválido" };
  if (senha.length < 8) return { ok: false, erro: "A senha deve ter ao menos 8 caracteres" };

  const existe = await db.query.usuarios.findFirst({ where: eq(usuarios.email, email) });
  if (existe) return { ok: false, erro: "Já existe um usuário com este e-mail" };

  try {
    await db.insert(usuarios).values({ nome, email, senhaHash: hashSenha(senha), papel });
    revalidatePath("/admin/configuracoes/usuarios");
    await logInfo({ action: "usuario_criar", actorId: sessao.id, papel }, "usuário criado");
    return { ok: true };
  } catch (err) {
    await logError({ err, action: "usuario_criar", actorId: sessao.id }, "falha ao criar usuário");
    return { ok: false, erro: "Falha ao criar usuário" };
  }
}

export async function alterarPapel(id: string, papel: Papel): Promise<Resultado> {
  const sessao = await getSessao();
  if (!sessao) return { ok: false, erro: "Não autenticado" };
  if (sessao.papel !== "admin") return { ok: false, erro: "Apenas administradores" };
  if (sessao.id === id && papel !== "admin") return { ok: false, erro: "Você não pode rebaixar a si mesmo" };

  try {
    await db.update(usuarios).set({ papel: papel === "admin" ? "admin" : "editor" }).where(eq(usuarios.id, id));
    revalidatePath("/admin/configuracoes/usuarios");
    await logInfo({ action: "usuario_alterar_papel", actorId: sessao.id, alvoId: id, papel }, "papel alterado");
    return { ok: true };
  } catch (err) {
    await logError({ err, action: "usuario_alterar_papel", actorId: sessao.id, alvoId: id }, "falha ao alterar papel");
    return { ok: false, erro: "Falha ao alterar papel" };
  }
}

export async function redefinirSenha(id: string, senha: string): Promise<Resultado> {
  const sessao = await getSessao();
  if (!sessao) return { ok: false, erro: "Não autenticado" };
  if (sessao.papel !== "admin") return { ok: false, erro: "Apenas administradores" };
  if ((senha ?? "").length < 8) return { ok: false, erro: "A senha deve ter ao menos 8 caracteres" };

  try {
    await db.update(usuarios).set({ senhaHash: hashSenha(senha) }).where(eq(usuarios.id, id));
    await logWarn({ action: "usuario_redefinir_senha", actorId: sessao.id, alvoId: id }, "senha redefinida por admin");
    return { ok: true };
  } catch (err) {
    await logError({ err, action: "usuario_redefinir_senha", actorId: sessao.id, alvoId: id }, "falha ao redefinir senha");
    return { ok: false, erro: "Falha ao redefinir senha" };
  }
}

// Troca da própria senha (qualquer usuário logado), exigindo a senha atual.
export async function alterarMinhaSenha(atual: string, nova: string): Promise<Resultado> {
  const sessao = await getSessao();
  if (!sessao) return { ok: false, erro: "Não autenticado" };
  if ((nova ?? "").length < 8) return { ok: false, erro: "A nova senha deve ter ao menos 8 caracteres" };

  const u = await db.query.usuarios.findFirst({ where: eq(usuarios.id, sessao.id) });
  if (!u) return { ok: false, erro: "Usuário não encontrado" };
  if (!verificarSenha(atual ?? "", u.senhaHash)) return { ok: false, erro: "Senha atual incorreta" };

  try {
    await db.update(usuarios).set({ senhaHash: hashSenha(nova) }).where(eq(usuarios.id, sessao.id));
    await logInfo({ action: "usuario_trocar_propria_senha", userId: sessao.id }, "senha própria alterada");
    return { ok: true };
  } catch (err) {
    await logError({ err, action: "usuario_trocar_propria_senha", userId: sessao.id }, "falha ao alterar a senha");
    return { ok: false, erro: "Falha ao alterar a senha" };
  }
}

export async function removerUsuario(id: string): Promise<Resultado> {
  const sessao = await getSessao();
  if (!sessao) return { ok: false, erro: "Não autenticado" };
  if (sessao.papel !== "admin") return { ok: false, erro: "Apenas administradores" };
  if (sessao.id === id) return { ok: false, erro: "Você não pode remover a si mesmo" };

  // Não deixar o sistema sem nenhum admin.
  const totalAdmins = (await db.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.papel, "admin"))).length;
  const alvo = await db.query.usuarios.findFirst({ where: eq(usuarios.id, id) });
  if (alvo?.papel === "admin" && totalAdmins <= 1) return { ok: false, erro: "É preciso manter ao menos um administrador" };

  try {
    await db.delete(usuarios).where(eq(usuarios.id, id));
    revalidatePath("/admin/configuracoes/usuarios");
    await logWarn({ action: "usuario_remover", actorId: sessao.id, alvoId: id }, "usuário removido");
    return { ok: true };
  } catch (err) {
    await logError({ err, action: "usuario_remover", actorId: sessao.id, alvoId: id }, "falha ao remover usuário");
    return { ok: false, erro: "Falha ao remover usuário" };
  }
}
