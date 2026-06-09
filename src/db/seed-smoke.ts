import { eq } from "drizzle-orm";
import { db, pool } from "@/lib/db";
import { empreendimentos, plantas, empreendimentoPlanta, leads } from "@/db/schema";

// Smoke: garante 1 planta vinculada e 1 lead no empreendimento demo.
async function main() {
  const emp = await db.query.empreendimentos.findFirst({
    where: eq(empreendimentos.slug, "vila-mariana-living"),
  });
  if (!emp) throw new Error("rode db:seed-demo antes");

  let planta = await db.query.plantas.findFirst({
    where: eq(plantas.slug, "vila-mariana-living-2-dorms"),
  });
  if (!planta) {
    [planta] = await db
      .insert(plantas)
      .values({
        slug: "vila-mariana-living-2-dorms",
        nome: "2 dormitórios",
        metragem: "52",
        dormitorios: 2,
        suites: 1,
        vagas: 1,
        recursos: ["Varanda", "Cozinha americana"],
      })
      .returning();
    await db
      .insert(empreendimentoPlanta)
      .values({ empreendimentoId: emp.id, plantaId: planta.id })
      .onConflictDoNothing();
  }

  await db.insert(leads).values({
    nome: "Maria Teste",
    email: "maria@exemplo.com",
    telefone: "11 99999-0000",
    mensagem: "Tenho interesse no 2 dormitórios.",
    empreendimentoId: emp.id,
    origem: emp.slug,
    status: "novo",
  });

  console.log("Smoke: planta + lead criados para Vila Mariana Living.");
  await pool.end();
}

main().catch((err) => {
  console.error("Falha no seed-smoke:", err);
  process.exit(1);
});
