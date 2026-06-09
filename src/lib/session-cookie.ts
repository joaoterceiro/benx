// Nome do cookie de sessão. Módulo neutro (sem server-only/db/crypto) para
// poder ser importado no middleware (runtime Edge) e na auth (runtime Node).
export const SESSION_COOKIE = "benx_session";
