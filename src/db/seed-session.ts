import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, pool } from "@/lib/db";
import { usuarios, sessoes } from "@/db/schema";

// Smoke de auth: cria uma sessão válida para o admin e imprime o token,
// para testar acesso autenticado via Cookie sem navegador.
async function main() {
  const admin = await db.query.usuarios.findFirst({
    where: eq(usuarios.email, "admin@benx.local"),
  });
  if (!admin) throw new Error("rode db:seed antes (admin não existe)");
  const token = randomBytes(32).toString("hex");
  await db.insert(sessoes).values({
    token,
    usuarioId: admin.id,
    expiraEm: new Date(Date.now() + 1000 * 60 * 60),
  });
  console.log(token);
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
