import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

// Runner de migrations. Roda os SQL versionados em ./drizzle contra o Postgres.
async function main() {
  const connectionString =
    process.env.DATABASE_URL ?? "postgres://benx:benx@localhost:5432/benx";
  const pool = new Pool({ connectionString });
  const db = drizzle(pool);

  console.log("Rodando migrations...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations aplicadas.");

  await pool.end();
}

main().catch((err) => {
  console.error("Falha nas migrations:", err);
  process.exit(1);
});
