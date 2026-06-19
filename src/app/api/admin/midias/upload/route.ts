import { NextResponse } from "next/server";
import { getSessao } from "@/lib/auth";
import { uploadMidia } from "@/lib/storage";
import { slugify } from "@/lib/utils";
import { logError } from "@/lib/log-context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIPOS_OK = ["image/", "video/", "audio/", "application/pdf"];

// Upload de mídia com suporte a progresso no cliente (XHR upload.onprogress).
// O arquivo vem como CORPO BRUTO (não multipart) para evitar limites/erros de
// parsing do formData() com arquivos grandes. Nome e tipo vêm nos headers.
export async function POST(req: Request): Promise<Response> {
  if (!(await getSessao())) return NextResponse.json({ ok: false, erro: "Não autenticado" }, { status: 401 });

  const contentType = (req.headers.get("content-type") || "application/octet-stream").split(";")[0].trim();
  const nomeArquivo = decodeURIComponent(req.headers.get("x-arquivo-nome") || "midia");
  if (!TIPOS_OK.some((t) => contentType.startsWith(t))) {
    return NextResponse.json({ ok: false, erro: "Tipo não permitido (imagem, vídeo, áudio ou PDF)" }, { status: 400 });
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(await req.arrayBuffer());
  } catch {
    return NextResponse.json({ ok: false, erro: "Falha ao ler o arquivo" }, { status: 400 });
  }
  if (buffer.length === 0) return NextResponse.json({ ok: false, erro: "Arquivo vazio" }, { status: 400 });

  try {
    const ext = (nomeArquivo.split(".").pop() ?? "bin").toLowerCase();
    const base = slugify(nomeArquivo.replace(/\.[^.]+$/, "")) || "midia";
    const stamp = Date.now().toString(36);
    const chave = `biblioteca/${stamp}-${base}.${ext}`;
    await uploadMidia(chave, buffer, contentType || undefined);
    return NextResponse.json({ ok: true, chave });
  } catch (err) {
    await logError({ err, action: "midia_upload" }, "Falha no upload via route handler");
    return NextResponse.json({ ok: false, erro: "Falha no upload" }, { status: 500 });
  }
}
