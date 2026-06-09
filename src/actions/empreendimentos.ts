"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { empreendimentos } from "@/db/schema";
import { cacheInvalidate } from "@/lib/cache";
import { uploadMidia } from "@/lib/storage";
import { getSessao } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { logError } from "@/lib/log-context";
import {
  persistirEmpreendimento,
  type SalvarPayload,
  type ResultadoSalvar,
} from "@/lib/empreendimento-service";

export type ActionResult = ResultadoSalvar;
export type { SalvarPayload, PlantaPayload } from "@/lib/empreendimento-service";

async function invalidar(vertente: string, slug: string) {
  await cacheInvalidate(`busca:${vertente}:`);
  revalidatePath("/admin/empreendimentos");
  revalidatePath(`/${vertente}`);
  revalidatePath(`/${vertente}/${slug}`);
}

// Salva (cria ou atualiza) o empreendimento completo. Casca fina: auth +
// persistência (serviço) + invalidação de cache. Vertentes mapeiam slug=value.
export async function salvarEmpreendimento(
  empId: string | null,
  payload: SalvarPayload
): Promise<ActionResult> {
  if (!(await getSessao())) return { ok: false, erro: "Não autenticado" };

  const r = await persistirEmpreendimento(empId, payload);
  if (r.ok) {
    const slugRota = { benx_iconicos: "iconicos", benx: "benx", vivabenx: "vivabenx" }[r.vertente ?? ""] ?? r.vertente ?? "";
    await invalidar(slugRota, r.slug);
    return { ok: true, id: r.id, slug: r.slug };
  }
  return r;
}

export async function excluirEmpreendimento(id: string): Promise<ActionResult> {
  const sessao = await getSessao();
  if (!sessao) return { ok: false, erro: "Não autenticado" };
  if (sessao.papel !== "admin") {
    return { ok: false, erro: "Apenas administradores podem excluir" };
  }
  try {
    const [row] = await db
      .delete(empreendimentos)
      .where(eq(empreendimentos.id, id))
      .returning({ id: empreendimentos.id, slug: empreendimentos.slug });
    if (!row) return { ok: false, erro: "Empreendimento não encontrado" };
    await cacheInvalidate("busca:");
    revalidatePath("/admin/empreendimentos");
    return { ok: true, id: row.id, slug: row.slug };
  } catch (err) {
    await logError({ err, action: "empreendimentos" }, "Falha ao excluir");
    return { ok: false, erro: "Falha ao excluir" };
  }
}

// Duplica um empreendimento (linha + plantas vinculadas + mídias), oculto.
export async function duplicarEmpreendimento(id: string): Promise<ActionResult> {
  const sessao = await getSessao();
  if (!sessao) return { ok: false, erro: "Não autenticado" };
  const orig = await db.query.empreendimentos.findFirst({
    where: eq(empreendimentos.id, id),
    with: { midias: true, plantas: true },
  });
  if (!orig) return { ok: false, erro: "Empreendimento não encontrado" };

  const nome = `${orig.nome} (cópia)`;
  let slug = `${orig.slug}-copia`;
  let n = 1;
  while (await db.query.empreendimentos.findFirst({ where: eq(empreendimentos.slug, slug) })) {
    n += 1; slug = `${orig.slug}-copia-${n}`;
  }

  const { id: _i, slug: _s, criadoEm: _c, atualizadoEm: _a, midias: mids, plantas: plks, ...resto } =
    orig as typeof orig & { midias: unknown[]; plantas: unknown[] };
  void _i; void _s; void _c; void _a;

  try {
    const [novo] = await db.insert(empreendimentos)
      .values({ ...resto, nome, slug, visivel: false })
      .returning({ id: empreendimentos.id });

    const { midias, empreendimentoPlanta } = await import("@/db/schema");
    const listaMid = (mids ?? []) as { tipo: string; chave: string; alt: string | null; ordem: number | null }[];
    if (listaMid.length) {
      await db.insert(midias).values(listaMid.map((m) => ({
        empreendimentoId: novo.id, tipo: m.tipo as typeof midias.$inferInsert.tipo, chave: m.chave, alt: m.alt ?? "", ordem: m.ordem ?? 0,
      })));
    }
    const listaPl = (plks ?? []) as { plantaId: string; ordem: number | null }[];
    if (listaPl.length) {
      await db.insert(empreendimentoPlanta).values(listaPl.map((p) => ({
        empreendimentoId: novo.id, plantaId: p.plantaId, ordem: p.ordem ?? 0,
      })));
    }
    revalidatePath("/admin/empreendimentos");
    return { ok: true, id: novo.id, slug };
  } catch (err) {
    await logError({ err, action: "empreendimentos" }, "Falha ao duplicar");
    return { ok: false, erro: "Falha ao duplicar" };
  }
}

// Ação em lote: define visibilidade de vários empreendimentos.
export async function definirVisibilidadeEmLote(ids: string[], visivel: boolean): Promise<{ ok: boolean; erro?: string }> {
  if (!(await getSessao())) return { ok: false, erro: "Não autenticado" };
  if (!ids.length) return { ok: true };
  try {
    const { inArray } = await import("drizzle-orm");
    await db.update(empreendimentos).set({ visivel }).where(inArray(empreendimentos.id, ids));
    await cacheInvalidate("busca:");
    revalidatePath("/admin/empreendimentos");
    return { ok: true };
  } catch (err) {
    await logError({ err, action: "empreendimentos" }, "Falha ao atualizar");
    return { ok: false, erro: "Falha ao atualizar" };
  }
}

// Ação em lote: exclui vários empreendimentos (apenas admin).
export async function excluirEmLote(ids: string[]): Promise<{ ok: boolean; erro?: string }> {
  const sessao = await getSessao();
  if (!sessao) return { ok: false, erro: "Não autenticado" };
  if (sessao.papel !== "admin") return { ok: false, erro: "Apenas administradores podem excluir" };
  if (!ids.length) return { ok: true };
  try {
    const { inArray } = await import("drizzle-orm");
    await db.delete(empreendimentos).where(inArray(empreendimentos.id, ids));
    await cacheInvalidate("busca:");
    revalidatePath("/admin/empreendimentos");
    return { ok: true };
  } catch (err) {
    await logError({ err, action: "empreendimentos" }, "Falha ao excluir");
    return { ok: false, erro: "Falha ao excluir" };
  }
}

// Upload de imagem single para o MinIO. Devolve a CHAVE para guardar no form.
export async function uploadImagem(
  formData: FormData
): Promise<{ ok: true; chave: string } | { ok: false; erro: string }> {
  if (!(await getSessao())) return { ok: false, erro: "Não autenticado" };
  const file = formData.get("arquivo");
  const escopo = String(formData.get("escopo") ?? "empreendimentos");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, erro: "Arquivo inválido" };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, erro: "Envie um arquivo de imagem" };
  }
  try {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const stamp = Date.now().toString(36);
    const chave = `${escopo}/${stamp}-${slugify(file.name.replace(/\.[^.]+$/, ""))}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadMidia(chave, buffer, file.type);
    return { ok: true, chave };
  } catch (err) {
    await logError({ err, action: "empreendimentos" }, "Falha no upload");
    return { ok: false, erro: "Falha no upload" };
  }
}
