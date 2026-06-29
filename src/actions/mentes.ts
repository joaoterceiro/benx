"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { configuracoes } from "@/db/schema";
import { getSessao } from "@/lib/auth";
import { logError } from "@/lib/log-context";
import type { ArquitetoConfig } from "@/lib/mentes";

export async function salvarArquitetos(lista: ArquitetoConfig[]): Promise<{ ok: boolean; erro?: string }> {
  if (!(await getSessao())) return { ok: false, erro: "Não autenticado" };
  try {
    const limpos = lista
      .filter((a) => a.nome.trim())
      .map((a) => ({ nome: a.nome, descricao: a.descricao, projeto: a.projeto, imagem: a.imagem }));
    const valor = JSON.stringify(limpos);
    await db
      .insert(configuracoes)
      .values({ chave: "mentes_arquitetos", valor })
      .onConflictDoUpdate({ target: configuracoes.chave, set: { valor, atualizadoEm: new Date() } });
    revalidatePath("/mentes-criativas");
    return { ok: true };
  } catch (err) {
    await logError({ err, action: "salvar_arquitetos" }, "Falha ao salvar arquitetos");
    return { ok: false, erro: "Falha ao salvar" };
  }
}
