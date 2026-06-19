"use server";

import { revalidatePath } from "next/cache";
import { uploadMidia, deleteMidia } from "@/lib/storage";
import { getSessao } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { logError } from "@/lib/log-context";

const TIPOS_OK = ["image/", "video/", "audio/", "application/pdf"];

// Upload genérico para a biblioteca de mídia (imagem, vídeo, áudio, PDF).
export async function uploadBiblioteca(
  formData: FormData
): Promise<{ ok: true; chave: string } | { ok: false; erro: string }> {
  if (!(await getSessao())) return { ok: false, erro: "Não autenticado" };
  const file = formData.get("arquivo");
  if (!(file instanceof File) || file.size === 0) return { ok: false, erro: "Arquivo inválido" };
  if (!TIPOS_OK.some((t) => file.type.startsWith(t))) {
    return { ok: false, erro: "Tipo não permitido (imagem, vídeo, áudio ou PDF)" };
  }
  try {
    const ext = (file.name.split(".").pop() ?? "bin").toLowerCase();
    const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "midia";
    const stamp = Date.now().toString(36);
    const chave = `biblioteca/${stamp}-${base}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadMidia(chave, buffer, file.type || undefined);
    revalidatePath("/admin/midias");
    return { ok: true, chave };
  } catch (err) {
    await logError({ err, action: "midia" }, "Falha no upload da biblioteca");
    return { ok: false, erro: "Falha no upload" };
  }
}

// Remove um objeto do storage (apenas admin).
export async function excluirMidiaBiblioteca(chave: string): Promise<{ ok: boolean; erro?: string }> {
  const sessao = await getSessao();
  if (!sessao) return { ok: false, erro: "Não autenticado" };
  if (sessao.papel !== "admin") return { ok: false, erro: "Apenas administradores podem excluir" };
  if (!chave) return { ok: false, erro: "Chave inválida" };
  try {
    await deleteMidia(chave);
    revalidatePath("/admin/midias");
    return { ok: true };
  } catch (err) {
    await logError({ err, action: "midia" }, "Falha ao excluir mídia");
    return { ok: false, erro: "Falha ao excluir" };
  }
}
