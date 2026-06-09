"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { configuracoes } from "@/db/schema";
import { getSessao } from "@/lib/auth";
import { uploadMidia, getUrl } from "@/lib/storage";
import type { SplashConfig, SplashBotao } from "@/lib/splash";
import { logError } from "@/lib/log-context";

// Upload de logo ou vídeo da splash direto para o MinIO. Retorna a CHAVE
// (persistida na config) e uma URL assinada para pré-visualização imediata.
export async function uploadSplashMidia(
  formData: FormData
): Promise<{ ok: boolean; chave?: string; url?: string; erro?: string }> {
  if (!(await getSessao())) return { ok: false, erro: "Não autenticado" };
  const file = formData.get("arquivo");
  if (!(file instanceof File) || file.size === 0) return { ok: false, erro: "Arquivo inválido" };

  const ehVideo = file.type.startsWith("video/");
  const ehImagem = file.type.startsWith("image/");
  if (!ehVideo && !ehImagem) return { ok: false, erro: "Envie uma imagem ou vídeo" };
  // Limites: 5MB imagem, 60MB vídeo.
  const limite = ehVideo ? 60 * 1024 * 1024 : 5 * 1024 * 1024;
  if (file.size > limite) return { ok: false, erro: `Arquivo acima do limite (${ehVideo ? "60MB" : "5MB"})` };

  const nomeLimpo = (file.name || "midia").replace(/[^a-zA-Z0-9.\-_]/g, "-").toLowerCase();
  const sufixo = Date.now().toString(36);
  const chave = `splash/${sufixo}-${nomeLimpo}`;
  try {
    await uploadMidia(chave, Buffer.from(await file.arrayBuffer()), file.type);
    const url = await getUrl(chave);
    return { ok: true, chave, url };
  } catch (err) {
    await logError({ err, action: "splash" }, "Falha no upload");
    return { ok: false, erro: "Falha no upload" };
  }
}

function limparBotao(b: SplashBotao): SplashBotao {
  let size = Number(b.logoSize);
  if (!Number.isFinite(size)) size = 40;
  size = Math.min(400, Math.max(10, Math.round(size)));
  return {
    label: (b.label ?? "").trim(),
    logoKey: b.logoKey === "viva" || b.logoKey === "extra" ? b.logoKey : "benx",
    href: (b.href ?? "#").trim() || "#",
    showLabel: !!b.showLabel,
    subtitle: (b.subtitle ?? "").trim(),
    logoSize: size,
  };
}

export async function salvarSplashConfig(
  input: SplashConfig
): Promise<{ ok: boolean; erro?: string }> {
  if (!(await getSessao())) return { ok: false, erro: "Não autenticado" };

  const botoes = (input.botoes ?? []).map(limparBotao).filter((b) => b.href || b.label);

  const pares: [string, string][] = [
    ["splash_video", (input.videoUrl ?? "").trim()],
    ["splash_logo_benx", (input.logoBenx ?? "").trim()],
    ["splash_logo_viva", (input.logoViva ?? "").trim()],
    ["splash_logo_extra", (input.logoExtra ?? "").trim()],
    ["splash_home", input.usarComoHome ? "true" : "false"],
    ["splash_botoes", JSON.stringify(botoes)],
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
    await logError({ err, action: "splash" }, "Falha ao salvar a splash page");
    return { ok: false, erro: "Falha ao salvar a splash page" };
  }
}
