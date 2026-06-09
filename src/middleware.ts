import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-cookie";

// Correlation id por request: reaproveita um id de proxy/CDN se já vier, senão
// gera um novo. Propaga no request (lido via next/headers nos logs) e expõe na
// resposta para correlação ponta a ponta.
function comRequestId(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();
  const headers = new Headers(req.headers);
  headers.set("x-request-id", requestId);
  return { requestId, headers };
}

// Guarda leve de UX: sem cookie de sessão, redireciona /admin para /login.
// A validação real (token no banco, expiração, papel) ocorre no layout do
// admin e nas Server Actions.
export function middleware(req: NextRequest) {
  const { requestId, headers } = comRequestId(req);

  const temCookie = req.cookies.has(SESSION_COOKIE);
  if (req.nextUrl.pathname.startsWith("/admin") && !temCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", req.nextUrl.pathname);
    const res = NextResponse.redirect(url);
    res.headers.set("x-request-id", requestId);
    return res;
  }

  const res = NextResponse.next({ request: { headers } });
  res.headers.set("x-request-id", requestId);
  return res;
}

export const config = {
  // Aplica em todas as rotas (gera requestId), exceto assets estáticos e _next.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|jpg|jpeg|png|webp|avif|gif|ico|woff2|mp4|txt|xml)$).*)"],
};
