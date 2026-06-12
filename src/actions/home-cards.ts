"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { empreendimentos } from "@/db/schema";
import { linhaIdPorValue } from "@/db/queries";
import { getSessao } from "@/lib/auth";
import { logError } from "@/lib/log-context";

export interface DestaquesHomeInput {
  // por vertente, os empreendimentos FIXADOS (primeiros), na ordem desejada.
  // O restante da linha cai em ordem_home = 0 (aleatório na home).
  vertentes: { value: string; ids: string[] }[];
}

export async function salvarDestaquesHome(input: DestaquesHomeInput): Promise<{ ok: boolean; erro?: string }> {
  if (!(await getSessao())) return { ok: false, erro: "Não autenticado" };

  try {
    for (const { value, ids } of input.vertentes) {
      const linhaId = await linhaIdPorValue(value);
      if (!linhaId) continue;
      // zera todos da linha (volta ao aleatório)
      await db.update(empreendimentos).set({ ordemHome: 0 }).where(eq(empreendimentos.linhaProdutoId, linhaId));
      // fixa os escolhidos: posição 1..N
      for (let i = 0; i < ids.length; i++) {
        await db.update(empreendimentos).set({ ordemHome: i + 1 }).where(eq(empreendimentos.id, ids[i]));
      }
    }
    // Homes de vertente são force-dynamic; revalida por garantia.
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    await logError({ err, action: "destaques_home" }, "Falha ao salvar destaques da home");
    return { ok: false, erro: "Falha ao salvar destaques" };
  }
}
