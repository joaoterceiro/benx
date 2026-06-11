import { headers } from "next/headers";
import { logger } from "@/lib/logger";

// Contexto de request para os logs. O requestId é gerado no middleware
// (header x-request-id) e lido aqui via next/headers. Fora de um escopo de
// request (ex.: handlers globais), degrada para undefined sem quebrar.

export async function getRequestId(): Promise<string | undefined> {
  // No build (prerender sem request real) não chamar headers(): isso marcaria a
  // rota como dinâmica e mataria o ISR. Em runtime funciona normalmente.
  if (process.env.NEXT_PHASE === "phase-production-build") return undefined;
  try {
    const h = await headers();
    return h.get("x-request-id") ?? undefined;
  } catch {
    return undefined;
  }
}

type LogObj = Record<string, unknown>;

async function emit(level: "info" | "warn" | "error" | "fatal", obj: LogObj, msg: string) {
  const requestId = await getRequestId();
  logger[level]({ requestId, ...obj }, msg);
}

// Helpers objeto-primeiro com requestId injetado automaticamente.
export const logInfo = (obj: LogObj, msg: string) => emit("info", obj, msg);
export const logWarn = (obj: LogObj, msg: string) => emit("warn", obj, msg);
export const logError = (obj: LogObj, msg: string) => emit("error", obj, msg);
export const logFatal = (obj: LogObj, msg: string) => emit("fatal", obj, msg);
