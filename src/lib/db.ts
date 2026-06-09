import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";

// Em produção, exige DATABASE_URL (evita subir com credenciais default).
if (
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PHASE !== "phase-production-build" &&
  !process.env.DATABASE_URL
) {
  throw new Error("DATABASE_URL é obrigatório em produção");
}

const connectionString =
  process.env.DATABASE_URL ?? "postgres://benx:benx@localhost:5432/benx";

// Reaproveita o pool entre hot reloads em dev (evita esgotar conexões).
const globalForDb = globalThis as unknown as { _benxPool?: Pool };
const pool = globalForDb._benxPool ?? new Pool({ connectionString });
if (process.env.NODE_ENV !== "production") globalForDb._benxPool = pool;

export const db = drizzle(pool, { schema });
export { pool };
