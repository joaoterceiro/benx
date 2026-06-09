"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { plantas, empreendimentoPlanta, empreendimentos } from "@/db/schema";
import { slugify } from "@/lib/utils";
import { getSessao } from "@/lib/auth";
import { plantaInputSchema, type PlantaInput } from "@/lib/validation/planta";
import { logError } from "@/lib/log-context";

export type PlantaResult =
  | { ok: true; id: string }
  | { ok: false; erro: string; campos?: Record<string, string> };

function validar(input: PlantaInput) {
  const parsed = plantaInputSchema.safeParse(input);
  if (!parsed.success) {
    const campos: Record<string, string> = {};
    for (const i of parsed.error.issues) {
      const k = String(i.path[0] ?? "_");
      if (!campos[k]) campos[k] = i.message;
    }
    return { campos };
  }
  return { data: parsed.data };
}

async function slugUnico(base: string): Promise<string> {
  let slug = slugify(base) || "planta";
  const existe = await db.query.plantas.findFirst({ where: eq(plantas.slug, slug) });
  if (existe) slug = `${slug}-${Date.now().toString(36)}`;
  return slug;
}

async function revalidarEmpreendimento(empId: string) {
  const emp = await db.query.empreendimentos.findFirst({
    where: eq(empreendimentos.id, empId),
    with: { linhaProduto: true },
  });
  revalidatePath(`/admin/empreendimentos/${empId}`);
  if (emp?.linhaProduto) revalidatePath(`/${emp.linhaProduto.slug}/${emp.slug}`);
}

// Cria uma planta e a vincula ao empreendimento (N:N).
export async function criarPlantaParaEmpreendimento(
  empId: string,
  input: PlantaInput
): Promise<PlantaResult> {
  if (!(await getSessao())) return { ok: false, erro: "Não autenticado" };
  const v = validar(input);
  if (!v.data) return { ok: false, erro: "Validação falhou", campos: v.campos };

  const emp = await db.query.empreendimentos.findFirst({
    where: eq(empreendimentos.id, empId),
  });
  if (!emp) return { ok: false, erro: "Empreendimento não encontrado" };

  try {
    const slug = await slugUnico(`${emp.slug}-${v.data.nome}`);
    const [planta] = await db
      .insert(plantas)
      .values({
        slug,
        nome: v.data.nome,
        metragem: v.data.metragem ?? null,
        dormitorios: v.data.dormitorios ?? null,
        suites: v.data.suites ?? null,
        vagas: v.data.vagas ?? null,
        imagemPlanta: v.data.imagemPlanta ?? null,
        recursos: v.data.recursos,
      })
      .returning({ id: plantas.id });

    await db
      .insert(empreendimentoPlanta)
      .values({ empreendimentoId: empId, plantaId: planta.id })
      .onConflictDoNothing();

    await revalidarEmpreendimento(empId);
    return { ok: true, id: planta.id };
  } catch (err) {
    await logError({ err, action: "plantas" }, "Falha ao salvar planta");
    return { ok: false, erro: "Falha ao salvar planta" };
  }
}

export async function atualizarPlanta(
  plantaId: string,
  empId: string,
  input: PlantaInput
): Promise<PlantaResult> {
  if (!(await getSessao())) return { ok: false, erro: "Não autenticado" };
  const v = validar(input);
  if (!v.data) return { ok: false, erro: "Validação falhou", campos: v.campos };
  try {
    await db
      .update(plantas)
      .set({
        nome: v.data.nome,
        metragem: v.data.metragem ?? null,
        dormitorios: v.data.dormitorios ?? null,
        suites: v.data.suites ?? null,
        vagas: v.data.vagas ?? null,
        imagemPlanta: v.data.imagemPlanta ?? null,
        recursos: v.data.recursos,
      })
      .where(eq(plantas.id, plantaId));
    await revalidarEmpreendimento(empId);
    return { ok: true, id: plantaId };
  } catch (err) {
    await logError({ err, action: "plantas" }, "Falha ao atualizar planta");
    return { ok: false, erro: "Falha ao atualizar planta" };
  }
}

// Desvincula a planta do empreendimento e remove a planta se ficar órfã.
// Exclusão global de uma planta (remove vínculos e a própria planta).
export async function excluirPlantaGlobal(plantaId: string): Promise<{ ok: boolean; erro?: string }> {
  if (!(await getSessao())) return { ok: false, erro: "Não autenticado" };
  try {
    await db.delete(empreendimentoPlanta).where(eq(empreendimentoPlanta.plantaId, plantaId));
    await db.delete(plantas).where(eq(plantas.id, plantaId));
    revalidatePath("/admin/plantas");
    return { ok: true };
  } catch (err) {
    await logError({ err, action: "plantas" }, "Falha ao excluir planta");
    return { ok: false, erro: "Falha ao excluir planta" };
  }
}

export async function removerPlanta(
  empId: string,
  plantaId: string
): Promise<PlantaResult> {
  if (!(await getSessao())) return { ok: false, erro: "Não autenticado" };
  try {
    await db
      .delete(empreendimentoPlanta)
      .where(
        and(
          eq(empreendimentoPlanta.empreendimentoId, empId),
          eq(empreendimentoPlanta.plantaId, plantaId)
        )
      );
    const aindaVinculada = await db.query.empreendimentoPlanta.findFirst({
      where: eq(empreendimentoPlanta.plantaId, plantaId),
    });
    if (!aindaVinculada) {
      await db.delete(plantas).where(eq(plantas.id, plantaId));
    }
    await revalidarEmpreendimento(empId);
    return { ok: true, id: plantaId };
  } catch (err) {
    await logError({ err, action: "plantas" }, "Falha ao remover planta");
    return { ok: false, erro: "Falha ao remover planta" };
  }
}
