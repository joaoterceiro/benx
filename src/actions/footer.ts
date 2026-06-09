"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { configuracoes } from "@/db/schema";
import { getSessao } from "@/lib/auth";
import { uploadMidia, getUrl } from "@/lib/storage";
import type { FooterConfig } from "@/lib/footer-config";
import { logError } from "@/lib/log-context";

export async function uploadFooterMidia(
  formData: FormData
): Promise<{ ok: boolean; chave?: string; url?: string; erro?: string }> {
  if (!(await getSessao())) return { ok: false, erro: "Não autenticado" };
  const file = formData.get("arquivo");
  if (!(file instanceof File) || file.size === 0) return { ok: false, erro: "Arquivo inválido" };
  if (!file.type.startsWith("image/")) return { ok: false, erro: "Envie uma imagem" };
  if (file.size > 8 * 1024 * 1024) return { ok: false, erro: "Imagem acima de 8MB" };
  const nome = (file.name || "img").replace(/[^a-zA-Z0-9.\-_]/g, "-").toLowerCase();
  const chave = `footer/${Date.now().toString(36)}-${nome}`;
  try {
    await uploadMidia(chave, Buffer.from(await file.arrayBuffer()), file.type);
    return { ok: true, chave, url: await getUrl(chave) };
  } catch (err) {
    await logError({ err, action: "footer" }, "Falha no upload");
    return { ok: false, erro: "Falha no upload" };
  }
}

export async function salvarFooterConfig(
  input: FooterConfig
): Promise<{ ok: boolean; erro?: string }> {
  if (!(await getSessao())) return { ok: false, erro: "Não autenticado" };

  const limparLinks = (lista: FooterConfig["paginas"]) =>
    JSON.stringify(
      (lista ?? [])
        .map((l) => ({ label: (l.label ?? "").trim(), href: (l.href ?? "").trim() || "#" }))
        .filter((l) => l.label)
    );

  const pares: [string, string][] = [
    ["footer_logo", (input.logo ?? "").trim()],
    ["footer_bg", (input.bgUrl ?? "").trim()],
    ["footer_frase", (input.frase ?? "").trim()],
    ["footer_sobre_url", (input.sobreUrl ?? "").trim()],
    ["footer_endereco", (input.endereco ?? "").trim()],
    ["footer_telefone", (input.telefone ?? "").trim()],
    ["footer_telefone_link", (input.telefoneLink ?? "").trim()],
    ["footer_rede_facebook", (input.redes?.facebook ?? "").trim()],
    ["footer_rede_x", (input.redes?.x ?? "").trim()],
    ["footer_rede_youtube", (input.redes?.youtube ?? "").trim()],
    ["footer_rede_instagram", (input.redes?.instagram ?? "").trim()],
    ["footer_rede_pinterest", (input.redes?.pinterest ?? "").trim()],
    ["footer_paginas", limparLinks(input.paginas)],
    ["footer_institucional", limparLinks(input.institucional)],
    ["footer_copyright", (input.copyright ?? "").trim()],
    ["footer_designby", (input.designBy ?? "").trim()],
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
    await logError({ err, action: "footer" }, "Falha ao salvar o footer");
    return { ok: false, erro: "Falha ao salvar o footer" };
  }
}
