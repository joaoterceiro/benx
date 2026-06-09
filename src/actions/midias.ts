"use server";

import { revalidatePath } from "next/cache";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { midias, empreendimentos } from "@/db/schema";
import { uploadMidia, deleteMidia, getUrl } from "@/lib/storage";
import { slugify } from "@/lib/utils";
import { getSessao } from "@/lib/auth";
import { logError, logWarn } from "@/lib/log-context";

const TIPOS = ["imagem", "video", "planta", "fachada", "area_comum", "obra"] as const;
type TipoMidia = (typeof TIPOS)[number];

export interface MidiaDTO {
  id: string;
  chave: string;
  tipo: TipoMidia;
  alt: string;
  url: string;
}

export type MidiaResult =
  | { ok: true; midia: MidiaDTO }
  | { ok: false; erro: string };

async function revalidar(empId: string) {
  const emp = await db.query.empreendimentos.findFirst({
    where: eq(empreendimentos.id, empId),
    with: { linhaProduto: true },
  });
  revalidatePath(`/admin/empreendimentos/${empId}`);
  revalidatePath("/admin/midias");
  if (emp?.linhaProduto) revalidatePath(`/${emp.linhaProduto.slug}/${emp.slug}`);
}

// Sobe um arquivo para o MinIO e cria a linha em midias.
export async function adicionarMidia(formData: FormData): Promise<MidiaResult> {
  if (!(await getSessao())) return { ok: false, erro: "Não autenticado" };
  const empId = String(formData.get("empreendimentoId") ?? "");
  const tipo = String(formData.get("tipo") ?? "imagem") as TipoMidia;
  const alt = String(formData.get("alt") ?? "");
  const file = formData.get("arquivo");

  if (!empId) return { ok: false, erro: "Empreendimento inválido" };
  if (!TIPOS.includes(tipo)) return { ok: false, erro: "Tipo de mídia inválido" };
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, erro: "Arquivo inválido" };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, erro: "Envie um arquivo de imagem" };
  }

  try {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const stamp = Date.now().toString(36);
    const chave = `empreendimentos/${empId}/${tipo}/${stamp}-${slugify(
      file.name.replace(/\.[^.]+$/, "")
    )}.${ext}`;
    await uploadMidia(chave, Buffer.from(await file.arrayBuffer()), file.type);

    const [{ proxima }] = await db
      .select({ proxima: sql<number>`coalesce(max(${midias.ordem}) + 1, 0)` })
      .from(midias)
      .where(and(eq(midias.empreendimentoId, empId), eq(midias.tipo, tipo)));

    const [row] = await db
      .insert(midias)
      .values({ empreendimentoId: empId, chave, tipo, alt, ordem: proxima })
      .returning({ id: midias.id });

    await revalidar(empId);
    const url = await getUrl(chave);
    return { ok: true, midia: { id: row.id, chave, tipo, alt, url } };
  } catch (err) {
    await logError({ err, action: "midias" }, "Falha ao enviar mídia");
    return { ok: false, erro: "Falha ao enviar mídia" };
  }
}

export async function removerMidia(
  midiaId: string,
  empId: string
): Promise<{ ok: boolean; erro?: string }> {
  if (!(await getSessao())) return { ok: false, erro: "Não autenticado" };
  try {
    const [row] = await db
      .delete(midias)
      .where(eq(midias.id, midiaId))
      .returning({ chave: midias.chave });
    if (row) {
      try {
        await deleteMidia(row.chave);
      } catch (err) {
        await logWarn({ err, action: "midias_delete_obj", chave: row.chave }, "objeto inexistente no storage (ignorado)");
      }
    }
    await revalidar(empId);
    return { ok: true };
  } catch (err) {
    await logError({ err, action: "midias" }, "Falha ao remover mídia");
    return { ok: false, erro: "Falha ao remover mídia" };
  }
}
