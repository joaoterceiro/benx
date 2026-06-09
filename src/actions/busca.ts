"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { configuracoes } from "@/db/schema";
import { getSessao } from "@/lib/auth";
import type { BuscaConfig } from "@/lib/busca-config";
import { logError } from "@/lib/log-context";

export async function salvarBuscaConfig(
  input: BuscaConfig
): Promise<{ ok: boolean; erro?: string }> {
  if (!(await getSessao())) return { ok: false, erro: "Não autenticado" };

  const pares: [string, string][] = [
    ["busca_titulo", (input.titulo ?? "").trim()],
    ["busca_placeholder", (input.placeholder ?? "").trim()],
    ["busca_cor", (input.cor ?? "").trim()],
    ["busca_qtd_cidades", String(Math.max(0, input.qtdCidades ?? 5))],
    ["busca_qtd_recentes", String(Math.max(0, input.qtdRecentes ?? 6))],
    ["busca_mostrar_filtros", input.mostrarFiltros ? "true" : "false"],
    ["busca_mostrar_cidades", input.mostrarCidades ? "true" : "false"],
    ["busca_mostrar_tipos", input.mostrarTipos ? "true" : "false"],
    ["busca_mostrar_recentes", input.mostrarRecentes ? "true" : "false"],
  ];
  try {
    for (const [chave, valor] of pares) {
      await db
        .insert(configuracoes)
        .values({ chave, valor })
        .onConflictDoUpdate({ target: configuracoes.chave, set: { valor, atualizadoEm: new Date() } });
    }
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    await logError({ err, action: "busca" }, "Falha ao salvar configurações da busca");
    return { ok: false, erro: "Falha ao salvar configurações da busca" };
  }
}
