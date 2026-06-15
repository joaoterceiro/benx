"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { configuracoes } from "@/db/schema";
import { getSessao } from "@/lib/auth";
import { logError } from "@/lib/log-context";
import { INFO_CHAVES, type ChaveInfo, type VarianteInfo } from "@/lib/info-habitacao";

export async function salvarInfoHabitacao(input: Record<ChaveInfo, VarianteInfo>): Promise<{ ok: boolean; erro?: string }> {
  if (!(await getSessao())) return { ok: false, erro: "Não autenticado" };
  try {
    for (const k of Object.keys(INFO_CHAVES) as ChaveInfo[]) {
      const v = input[k];
      const valor = JSON.stringify({
        titulo: (v?.titulo ?? "").trim(),
        secoes: (v?.secoes ?? []).map((s) => ({ q: (s.q ?? "").trim(), html: s.html ?? "" })).filter((s) => s.q || s.html),
      });
      await db
        .insert(configuracoes)
        .values({ chave: INFO_CHAVES[k], valor })
        .onConflictDoUpdate({ target: configuracoes.chave, set: { valor, atualizadoEm: new Date() } });
    }
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    await logError({ err, action: "info_habitacao" }, "Falha ao salvar informações de habitação");
    return { ok: false, erro: "Falha ao salvar" };
  }
}
