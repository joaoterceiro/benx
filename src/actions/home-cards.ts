"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { empreendimentos, configuracoes } from "@/db/schema";
import { linhaIdPorValue } from "@/db/queries";
import { chaveStrip, chavePromo, type ModoStrip, type StripCols } from "@/lib/strip-config";
import { getSessao } from "@/lib/auth";
import { logError } from "@/lib/log-context";

export interface DestaquesHomeInput {
  vertentes: {
    value: string;
    ids: string[]; // fixados (primeiros), em ordem. O restante = ordem_home 0.
    cols: StripCols; // cards por breakpoint
    modo: ModoStrip; // ordenação do restante
    tags: string[]; // sequência de tags (status)
    promos: string[]; // faixa "Conheça nossa linha": IDs em ordem (vazio = herda a faixa normal)
  }[];
}

export async function salvarDestaquesHome(input: DestaquesHomeInput): Promise<{ ok: boolean; erro?: string }> {
  if (!(await getSessao())) return { ok: false, erro: "Não autenticado" };

  try {
    for (const { value, ids, cols, modo, tags, promos } of input.vertentes) {
      const linhaId = await linhaIdPorValue(value);
      if (!linhaId) continue;
      // fixados: zera a linha e marca 1..N
      await db.update(empreendimentos).set({ ordemHome: 0 }).where(eq(empreendimentos.linhaProdutoId, linhaId));
      for (let i = 0; i < ids.length; i++) {
        await db.update(empreendimentos).set({ ordemHome: i + 1 }).where(eq(empreendimentos.id, ids[i]));
      }
      // layout + ordenação por vertente
      const valor = JSON.stringify({ cols, modo, tags });
      await db
        .insert(configuracoes)
        .values({ chave: chaveStrip(value), valor })
        .onConflictDoUpdate({ target: configuracoes.chave, set: { valor, atualizadoEm: new Date() } });
      // faixa "Conheça nossa linha" (cross-promo): IDs em ordem
      const valorPromo = JSON.stringify({ ids: promos });
      await db
        .insert(configuracoes)
        .values({ chave: chavePromo(value), valor: valorPromo })
        .onConflictDoUpdate({ target: configuracoes.chave, set: { valor: valorPromo, atualizadoEm: new Date() } });
    }
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    await logError({ err, action: "destaques_home" }, "Falha ao salvar destaques da home");
    return { ok: false, erro: "Falha ao salvar destaques" };
  }
}
