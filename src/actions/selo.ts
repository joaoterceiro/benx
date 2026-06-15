"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { configuracoes } from "@/db/schema";
import { getSessao } from "@/lib/auth";
import { logError } from "@/lib/log-context";
import type { SeloConfig } from "@/lib/selo";

export async function salvarSeloConfig(
  input: SeloConfig
): Promise<{ ok: boolean; erro?: string }> {
  if (!(await getSessao())) return { ok: false, erro: "Não autenticado" };

  const pares: [string, string][] = [
    ["selo_posicao", input.posicao],
    ["selo_tamanho", String(input.tamanho)],
    ["selo_margem", String(input.margem)],
    ["selo_opacidade", String(input.opacidade)],
  ];
  try {
    for (const [chave, valor] of pares) {
      await db
        .insert(configuracoes)
        .values({ chave, valor })
        .onConflictDoUpdate({ target: configuracoes.chave, set: { valor, atualizadoEm: new Date() } });
    }
    // Revalida todo o app: o selo é renderizado nas cards de várias páginas.
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    await logError({ err, action: "selo_config" }, "Falha ao salvar config do selo");
    return { ok: false, erro: "Falha ao salvar configurações" };
  }
}
