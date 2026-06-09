import pino from "pino";
import { REDACTION_PATHS } from "@/lib/redaction-paths";

// Logger central da aplicação (Pino).
// - 6 níveis: trace, debug, info, warn, error, fatal.
// - JSON em produção (stdout, pronto para coletor); pretty opcional em dev.
// - redact: senhas/tokens/dados pessoais nunca chegam ao output.
// Não usa transport com worker-thread (evita problemas de bundling do Next).

const isProd = process.env.NODE_ENV === "production";
const level = process.env.LOG_LEVEL ?? (isProd ? "info" : "debug");

export const logger = pino({
  level,
  base: { service: "benx", env: process.env.NODE_ENV ?? "development" },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  redact: {
    paths: REDACTION_PATHS,
    censor: "[REDACTED]",
  },
  serializers: {
    err: pino.stdSerializers.err, // name, message, stack, cause
  },
});

export type Logger = typeof logger;
