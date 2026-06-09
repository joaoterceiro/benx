import { NextResponse } from "next/server";
import { getSessao } from "@/lib/auth";
import { uploadMidia, getUrl } from "@/lib/storage";
import { logError } from "@/lib/log-context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function slugify(s: string): string {
  return (
    s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "arquivo"
  );
}

// Upload com progresso real (consumido via XHR no cliente). Mesma regra de
// negócio do action uploadImagem: só imagens, chave gerada por escopo.
export async function POST(req: Request) {
  if (!(await getSessao())) {
    return NextResponse.json({ ok: false, erro: "Não autenticado" }, { status: 401 });
  }
  const fd = await req.formData();
  const file = fd.get("arquivo");
  const escopo = String(fd.get("escopo") ?? "empreendimentos");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ ok: false, erro: "Arquivo inválido" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ ok: false, erro: "Envie um arquivo de imagem" }, { status: 400 });
  }
  try {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const stamp = Date.now().toString(36);
    const chave = `${escopo}/${stamp}-${slugify(file.name.replace(/\.[^.]+$/, ""))}.${ext}`;
    await uploadMidia(chave, Buffer.from(await file.arrayBuffer()), file.type);
    const url = await getUrl(chave);
    return NextResponse.json({ ok: true, chave, url });
  } catch (err) {
    await logError({ err, action: "api_upload" }, "falha no upload via route handler");
    return NextResponse.json({ ok: false, erro: "Falha no upload" }, { status: 500 });
  }
}
