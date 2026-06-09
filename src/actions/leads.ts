"use server";

import { db } from "@/lib/db";
import { leads } from "@/db/schema";
import { leadInputSchema, type LeadInput } from "@/lib/validation/lead";
import { logInfo, logError } from "@/lib/log-context";

export type LeadResult =
  | { ok: true }
  | { ok: false; erro: string; campos?: Record<string, string> };

// Captação de lead no site público. (A gestão de leads no admin foi removida.)
export async function criarLead(input: LeadInput): Promise<LeadResult> {
  const parsed = leadInputSchema.safeParse(input);
  if (!parsed.success) {
    const campos: Record<string, string> = {};
    for (const i of parsed.error.issues) {
      const k = String(i.path[0] ?? "_");
      if (!campos[k]) campos[k] = i.message;
    }
    return { ok: false, erro: "Verifique os campos", campos };
  }
  try {
    await db.insert(leads).values({
      nome: parsed.data.nome,
      email: parsed.data.email ?? null,
      telefone: parsed.data.telefone ?? null,
      mensagem: parsed.data.mensagem ?? null,
      empreendimentoId: parsed.data.empreendimentoId ?? null,
      origem: parsed.data.origem ?? null,
      consentimento: true,
      consentimentoEm: new Date(),
      status: "novo",
    });
    await logInfo({ action: "criar_lead", origem: parsed.data.origem ?? null, empreendimentoId: parsed.data.empreendimentoId ?? null }, "lead recebido");
    return { ok: true };
  } catch (err) {
    await logError({ err, action: "criar_lead", origem: parsed.data.origem ?? null, empreendimentoId: parsed.data.empreendimentoId ?? null }, "falha ao gravar lead");
    return { ok: false, erro: "Falha ao enviar. Tente novamente." };
  }
}
