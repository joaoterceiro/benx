"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { configuracoes } from "@/db/schema";
import { getSessao } from "@/lib/auth";
import { logError } from "@/lib/log-context";

export interface ConfigInput {
  whatsappNumero: string;
  whatsappAtivo: boolean;
  whatsappTexto: string;
  whatsappMensagem: string;
}

export async function salvarConfiguracoes(
  input: ConfigInput
): Promise<{ ok: boolean; erro?: string }> {
  if (!(await getSessao())) return { ok: false, erro: "Não autenticado" };

  const pares: [string, string][] = [
    ["whatsapp_numero", (input.whatsappNumero ?? "").replace(/\D/g, "")],
    ["whatsapp_ativo", input.whatsappAtivo ? "true" : "false"],
    ["whatsapp_texto", (input.whatsappTexto ?? "").trim()],
    ["whatsapp_mensagem", (input.whatsappMensagem ?? "").trim()],
  ];
  try {
    for (const [chave, valor] of pares) {
      await db
        .insert(configuracoes)
        .values({ chave, valor })
        .onConflictDoUpdate({ target: configuracoes.chave, set: { valor, atualizadoEm: new Date() } });
    }
    // Revalida todo o app: o widget global é renderizado no layout raiz.
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    await logError({ err, action: "configuracoes" }, "Falha ao salvar configurações");
    return { ok: false, erro: "Falha ao salvar configurações" };
  }
}
