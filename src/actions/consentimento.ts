"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { consentimentos } from "@/db/schema";
import { logError } from "@/lib/log-context";

export interface ConsentimentoInput {
  versao: string;
  analiticos: boolean;
  marketing: boolean;
  acao: "aceitar_todos" | "recusar" | "personalizado";
}

// Registra o consentimento de cookies no servidor (LGPD art. 8 §1: ônus de
// prova do consentimento). Guarda versão, opções, ação, IP e user-agent.
export async function registrarConsentimento(input: ConsentimentoInput): Promise<{ ok: boolean }> {
  try {
    const h = await headers();
    const ua = h.get("user-agent");
    const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || null;
    await db.insert(consentimentos).values({
      versao: input.versao,
      necessarios: true,
      analiticos: !!input.analiticos,
      marketing: !!input.marketing,
      acao: input.acao,
      userAgent: ua ?? null,
      ip,
    });
    return { ok: true };
  } catch (err) {
    await logError({ err, action: "registrar_consentimento" }, "falha ao registrar consentimento");
    return { ok: false };
  }
}
