"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { usuarios } from "@/db/schema";
import { verificarSenha, criarSessao, destruirSessao } from "@/lib/auth";
import { logInfo, logWarn, logError } from "@/lib/log-context";
import { maskEmail } from "@/lib/mask";
import { redis } from "@/lib/cache";

export type LoginResult = { ok: true } | { ok: false; erro: string };

// Rate limit de login (anti brute force): N tentativas por janela, por e-mail.
const MAX_TENTATIVAS = 5;
const JANELA_SEG = 15 * 60; // 15 min

async function tentativasExcedidas(chave: string): Promise<boolean> {
  try {
    const n = Number(await redis.get(chave)) || 0;
    return n >= MAX_TENTATIVAS;
  } catch {
    return false; // redis fora: não bloqueia o login (fail open)
  }
}
async function registrarFalha(chave: string): Promise<void> {
  try {
    const n = await redis.incr(chave);
    if (n === 1) await redis.expire(chave, JANELA_SEG);
  } catch { /* best-effort */ }
}
async function limparTentativas(chave: string): Promise<void> {
  try { await redis.del(chave); } catch { /* best-effort */ }
}

export async function entrar(input: { email: string; senha: string }): Promise<LoginResult> {
  const email = input.email?.trim().toLowerCase();
  if (!email || !input.senha) return { ok: false, erro: "Informe e-mail e senha" };

  const rlKey = `login_rl:${email}`;
  if (await tentativasExcedidas(rlKey)) {
    await logWarn({ action: "login_bloqueado", email: maskEmail(email) }, "login bloqueado por excesso de tentativas");
    return { ok: false, erro: "Muitas tentativas. Tente novamente em alguns minutos." };
  }

  try {
    const u = await db.query.usuarios.findFirst({ where: eq(usuarios.email, email) });
    // Verifica a senha mesmo sem usuário, para não vazar existência de e-mail.
    const hash = u?.senhaHash ?? "x:y";
    const ok = verificarSenha(input.senha, hash);
    if (!u || !ok) {
      await registrarFalha(rlKey);
      await logWarn({ action: "login_falha", email: maskEmail(email) }, "tentativa de login inválida");
      return { ok: false, erro: "Credenciais inválidas" };
    }

    await limparTentativas(rlKey);
    await criarSessao(u.id);
    await logInfo({ action: "login_ok", userId: u.id, papel: u.papel }, "login efetuado");
    return { ok: true };
  } catch (err) {
    await logError({ err, action: "login_erro", email: maskEmail(email) }, "falha ao processar login");
    return { ok: false, erro: "Não foi possível entrar. Tente novamente." };
  }
}

export async function sair(): Promise<void> {
  await destruirSessao();
  await logInfo({ action: "logout" }, "logout efetuado");
  redirect("/login");
}
