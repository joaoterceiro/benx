// Instrumentação do Next: registra handlers globais de erro no boot do server.
// Roda só no runtime Node (não no Edge/middleware).
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { logger } = await import("@/lib/logger");

  process.on("unhandledRejection", (reason) => {
    logger.fatal({ err: reason, action: "unhandled_rejection" }, "rejeição de promise não tratada");
  });

  process.on("uncaughtException", (err) => {
    logger.fatal({ err, action: "uncaught_exception" }, "exceção não capturada");
  });

  logger.info({ action: "boot" }, "aplicação inicializada");
}
