import "server-only";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { sessoes } from "@/db/schema";
import { SESSION_COOKIE } from "@/lib/session-cookie";
import { logWarn } from "@/lib/log-context";

export { hashSenha, verificarSenha } from "@/lib/senha";
export { SESSION_COOKIE } from "@/lib/session-cookie";

const DURACAO_MS = 1000 * 60 * 60 * 24 * 7; // 7 dias

export interface SessaoUsuario {
  id: string;
  nome: string;
  email: string;
  papel: "admin" | "editor";
}

// ── Sessões (token aleatório guardado no banco + cookie httpOnly) ────────
// criarSessao/destruirSessao escrevem cookie: chamar só de Server Action ou Route.
export async function criarSessao(usuarioId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiraEm = new Date(Date.now() + DURACAO_MS);
  await db.insert(sessoes).values({ token, usuarioId, expiraEm });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiraEm,
  });
}

export async function destruirSessao(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      await db.delete(sessoes).where(eq(sessoes.token, token));
    } catch (err) {
      await logWarn({ err, action: "sessao_revogar" }, "falha ao revogar sessão no banco");
    }
    jar.delete(SESSION_COOKIE);
  }
}

// Lê a sessão atual (qualquer contexto de servidor). Limpa sessão expirada.
export async function getSessao(): Promise<SessaoUsuario | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const s = await db.query.sessoes.findFirst({
    where: eq(sessoes.token, token),
    with: { usuario: true },
  });
  if (!s) return null;
  if (s.expiraEm.getTime() < Date.now()) {
    try {
      await db.delete(sessoes).where(eq(sessoes.token, token));
    } catch (err) {
      await logWarn({ err, action: "sessao_limpar_expirada" }, "falha ao limpar sessão expirada");
    }
    return null;
  }
  return {
    id: s.usuario.id,
    nome: s.usuario.nome,
    email: s.usuario.email,
    papel: s.usuario.papel,
  };
}
