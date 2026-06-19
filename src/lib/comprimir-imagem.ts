// Compressão de imagem no navegador (canvas). Só roda no cliente.
// Vídeos/áudio/PDF não são comprimidos aqui (passam direto).

export type NivelCompressao = "original" | "otimizada" | "maxima";

const PRESETS: Record<Exclude<NivelCompressao, "original">, { lado: number; q: number }> = {
  otimizada: { lado: 1920, q: 0.82 },
  maxima: { lado: 1280, q: 0.62 },
};

// True se o arquivo é uma imagem comprimível (exclui SVG e GIF animado).
export function ehImagemComprimivel(file: File): boolean {
  return file.type.startsWith("image/") && file.type !== "image/svg+xml" && file.type !== "image/gif";
}

export async function comprimirImagem(file: File, nivel: NivelCompressao): Promise<File> {
  if (nivel === "original" || !ehImagemComprimivel(file)) return file;
  const preset = PRESETS[nivel];
  try {
    const bitmap = await createImageBitmap(file);
    const escala = Math.min(1, preset.lado / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * escala));
    const h = Math.max(1, Math.round(bitmap.height * escala));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/webp", preset.q));
    if (!blob || blob.size >= file.size) return file; // não compensou: mantém o original
    const nome = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], nome, { type: "image/webp" });
  } catch {
    return file;
  }
}
