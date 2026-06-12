"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { empreendimentos, configuracoes } from "@/db/schema";
import { getSessao } from "@/lib/auth";
import { logError } from "@/lib/log-context";

export interface OrdemHomeInput {
  // posição de cada empreendimento na faixa (menor = primeiro)
  ordens: { id: string; ordem: number }[];
  // modo por vertente: 'manual' | 'aleatorio'
  modos: Record<string, "manual" | "aleatorio">;
}

export async function salvarOrdemHome(input: OrdemHomeInput): Promise<{ ok: boolean; erro?: string }> {
  if (!(await getSessao())) return { ok: false, erro: "Não autenticado" };

  try {
    for (const { id, ordem } of input.ordens) {
      await db
        .update(empreendimentos)
        .set({ ordemHome: Number.isFinite(ordem) ? ordem : 0 })
        .where(eq(empreendimentos.id, id));
    }
    for (const [value, modo] of Object.entries(input.modos)) {
      const valor = modo === "aleatorio" ? "aleatorio" : "manual";
      await db
        .insert(configuracoes)
        .values({ chave: `home_ordem_modo_${value}`, valor })
        .onConflictDoUpdate({ target: configuracoes.chave, set: { valor, atualizadoEm: new Date() } });
    }
    // As homes de vertente são force-dynamic, mas revalida por garantia (caches de dados).
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    await logError({ err, action: "ordem_home" }, "Falha ao salvar ordenação da home");
    return { ok: false, erro: "Falha ao salvar ordenação" };
  }
}
