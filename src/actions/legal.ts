"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { configuracoes } from "@/db/schema";
import { getSessao } from "@/lib/auth";
import { sanitizarHtml } from "@/lib/sanitize";
import { logError } from "@/lib/log-context";

export interface LegalInput {
  politica: string;
  termos: string;
  cookiesTexto: string;
}

export async function salvarLegal(input: LegalInput): Promise<{ ok: boolean; erro?: string }> {
  if (!(await getSessao())) return { ok: false, erro: "Não autenticado" };

  const pares: [string, string][] = [
    ["politica_privacidade", sanitizarHtml((input.politica ?? "").trim())],
    ["termos_uso", sanitizarHtml((input.termos ?? "").trim())],
    ["cookies_texto", (input.cookiesTexto ?? "").trim()],
  ];
  try {
    for (const [chave, valor] of pares) {
      await db
        .insert(configuracoes)
        .values({ chave, valor })
        .onConflictDoUpdate({ target: configuracoes.chave, set: { valor, atualizadoEm: new Date() } });
    }
    revalidatePath("/", "layout");
    revalidatePath("/politica-de-privacidade");
    revalidatePath("/termos-de-uso");
    return { ok: true };
  } catch (err) {
    await logError({ err, action: "legal" }, "Falha ao salvar textos legais");
    return { ok: false, erro: "Falha ao salvar textos legais" };
  }
}
