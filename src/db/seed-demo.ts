import { eq } from "drizzle-orm";
import { db, pool } from "@/lib/db";
import { empreendimentos, cidades, linhasProduto } from "@/db/schema";

// Seed de demonstração: 1 empreendimento na vertente Benx, para smoke test
// da listagem pública e do admin. Idempotente pelo slug.
async function main() {
  const linha = await db.query.linhasProduto.findFirst({
    where: eq(linhasProduto.slug, "benx"),
  });
  if (!linha) throw new Error("rode db:seed antes (linhas_produto vazio)");

  let cidade = await db.query.cidades.findFirst({ where: eq(cidades.slug, "sao-paulo") });
  if (!cidade) {
    [cidade] = await db
      .insert(cidades)
      .values({ nome: "São Paulo", estado: "SP", slug: "sao-paulo" })
      .returning();
  }

  await db
    .insert(empreendimentos)
    .values({
      slug: "vila-mariana-living",
      nome: "Vila Mariana Living",
      subtitulo: "2 e 3 dormitórios no coração da Vila Mariana",
      statusObra: "em_construcao",
      tipoHabitacao: "his_e_hmp",
      oProjeto: "Empreendimento de médio padrão com lazer completo.",
      totalUnidades: 120,
      numeroTorres: 2,
      totalAndares: 18,
      quartos: "2 e 3",
      vagas: "1 e 2",
      metragemResidencial: "48 a 72 m²",
      obraFundacao: 100,
      obraAlvenaria: 80,
      obraAcabamento: 40,
      obraTotal: 62,
      exibirObras: true,
      exibirLocalizacao: true,
      enderecoCompleto: "Rua Vergueiro, 1000 - Vila Mariana, São Paulo - SP",
      diferenciais: ["Piscina", "Academia", "Coworking", "Pet place"],
      areasComuns: [{ nome: "Salão de festas" }, { nome: "Playground" }],
      visivel: true,
      cidadeId: cidade.id,
      linhaProdutoId: linha.id,
    })
    .onConflictDoNothing({ target: empreendimentos.slug });

  console.log("Demo: Vila Mariana Living (vertente benx) pronto.");
  await pool.end();
}

main().catch((err) => {
  console.error("Falha no seed-demo:", err);
  process.exit(1);
});
