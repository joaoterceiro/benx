"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { heroSlides } from "@/db/schema";
import { getSessao } from "@/lib/auth";
import { uploadMidia, getUrl } from "@/lib/storage";
import { logError } from "@/lib/log-context";

export interface SlideInput {
  id?: string;
  titulo: string;
  imagem: string;     // chave MinIO ou path/URL
  videoUrl: string;
  link: string;
  botaoTexto: string;
  tags: string[];
  locais: string[];   // vertente values
  ordem: number;
  duracao: number;    // segundos visível
  ativo: boolean;
}

type Resultado = { ok: boolean; erro?: string };

export async function salvarSlide(input: SlideInput): Promise<Resultado> {
  if (!(await getSessao())) return { ok: false, erro: "Não autenticado" };
  const titulo = (input.titulo ?? "").trim();
  if (!titulo) return { ok: false, erro: "Informe o título" };
  if (!input.imagem && !input.videoUrl) return { ok: false, erro: "Adicione uma imagem (ou vídeo)" };
  if (!input.locais?.length) return { ok: false, erro: "Selecione ao menos um local de exibição" };

  const valores = {
    titulo,
    imagem: (input.imagem ?? "").trim() || null,
    videoUrl: (input.videoUrl ?? "").trim() || null,
    link: (input.link ?? "").trim() || null,
    botaoTexto: (input.botaoTexto ?? "").trim() || "Conheça",
    tags: (input.tags ?? []).map((t) => t.trim()).filter(Boolean),
    locais: input.locais,
    ordem: Number.isFinite(input.ordem) ? input.ordem : 0,
    duracao: Number.isFinite(input.duracao) && input.duracao > 0 ? Math.min(60, Math.max(1, Math.round(input.duracao))) : 6,
    ativo: !!input.ativo,
    atualizadoEm: new Date(),
  };

  try {
    if (input.id) await db.update(heroSlides).set(valores).where(eq(heroSlides.id, input.id));
    else await db.insert(heroSlides).values(valores);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    await logError({ err, action: "slider" }, "Falha ao salvar o slide");
    return { ok: false, erro: "Falha ao salvar o slide" };
  }
}

export async function removerSlide(id: string): Promise<Resultado> {
  if (!(await getSessao())) return { ok: false, erro: "Não autenticado" };
  try {
    await db.delete(heroSlides).where(eq(heroSlides.id, id));
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    await logError({ err, action: "slider" }, "Falha ao remover");
    return { ok: false, erro: "Falha ao remover" };
  }
}

export async function uploadSlideMidia(
  formData: FormData
): Promise<{ ok: boolean; chave?: string; url?: string; tipo?: "imagem" | "video"; erro?: string }> {
  if (!(await getSessao())) return { ok: false, erro: "Não autenticado" };
  const file = formData.get("arquivo");
  if (!(file instanceof File) || file.size === 0) return { ok: false, erro: "Arquivo inválido" };
  const ehVideo = file.type.startsWith("video/");
  const ehImagem = file.type.startsWith("image/");
  if (!ehVideo && !ehImagem) return { ok: false, erro: "Envie imagem ou vídeo" };
  const limite = ehVideo ? 60 * 1024 * 1024 : 8 * 1024 * 1024;
  if (file.size > limite) return { ok: false, erro: `Arquivo acima do limite (${ehVideo ? "60MB" : "8MB"})` };

  const nome = (file.name || "midia").replace(/[^a-zA-Z0-9.\-_]/g, "-").toLowerCase();
  const chave = `slides/${Date.now().toString(36)}-${nome}`;
  try {
    await uploadMidia(chave, Buffer.from(await file.arrayBuffer()), file.type);
    return { ok: true, chave, url: await getUrl(chave), tipo: ehVideo ? "video" : "imagem" };
  } catch (err) {
    await logError({ err, action: "slider" }, "Falha no upload");
    return { ok: false, erro: "Falha no upload" };
  }
}
