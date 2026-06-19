import { NextResponse } from "next/server";
import { getSessao } from "@/lib/auth";
import { uploadMidia } from "@/lib/storage";
import { slugify } from "@/lib/utils";
import { logError } from "@/lib/log-context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIPOS_OK = ["image/", "video/", "audio/", "application/pdf"];

// Upload de mídia com suporte a progresso no cliente (XHR upload.onprogress).
// Server Actions não expõem progresso de upload; por isso usamos route handler.
export async function POST(req: Request): Promise<Response> {
  if (!(await getSessao())) return NextResponse.json({ ok: false, erro: "Não autenticado" }, { status: 401 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, erro: "Corpo inválido" }, { status: 400 });
  }
  const file = form.get("arquivo");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ ok: false, erro: "Arquivo inválido" }, { status: 400 });
  }
  if (!TIPOS_OK.some((t) => file.type.startsWith(t))) {
    return NextResponse.json({ ok: false, erro: "Tipo não permitido (imagem, vídeo, áudio ou PDF)" }, { status: 400 });
  }

  try {
    const ext = (file.name.split(".").pop() ?? "bin").toLowerCase();
    const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "midia";
    const stamp = Date.now().toString(36);
    const chave = `biblioteca/${stamp}-${base}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadMidia(chave, buffer, file.type || undefined);
    return NextResponse.json({ ok: true, chave });
  } catch (err) {
    await logError({ err, action: "midia_upload" }, "Falha no upload via route handler");
    return NextResponse.json({ ok: false, erro: "Falha no upload" }, { status: 500 });
  }
}
