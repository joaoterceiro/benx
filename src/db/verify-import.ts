/* Verificação pós-import. Rode: npx tsx src/db/verify-import.ts */
import { sql } from "drizzle-orm";
import { db, pool } from "@/lib/db";
import { empreendimentos, plantas, midias, categorias, cidades, bairros } from "@/db/schema";
import { getUrl } from "@/lib/storage";

async function main() {
  const cont = async (t: any, label: string) => {
    const [{ n }] = await db.select({ n: sql<number>`cast(count(*) as int)` }).from(t);
    console.log(`  ${String(n).padStart(5)}  ${label}`);
  };
  console.log("\n== Contagens ==");
  await cont(empreendimentos, "empreendimentos");
  await cont(plantas, "plantas");
  await cont(midias, "midias (fachada/obra)");
  await cont(categorias, "categorias");
  await cont(cidades, "cidades");
  await cont(bairros, "bairros");

  const porLinha = await db
    .select({ linha: sql<string>`coalesce(${empreendimentos.linhaProdutoId}::text,'?')`, n: sql<number>`cast(count(*) as int)` })
    .from(empreendimentos)
    .groupBy(empreendimentos.linhaProdutoId);
  console.log(`\n== Empreendimentos por linhaProdutoId ==`);
  for (const r of porLinha) console.log(`  ${String(r.n).padStart(4)}  ${r.linha}`);

  const comImg = await db.query.empreendimentos.findFirst({
    where: sql`${empreendimentos.imagemPrincipal} is not null`,
    columns: { nome: true, slug: true, imagemPrincipal: true, statusObra: true },
  });
  console.log(`\n== Amostra com imagem ==`);
  console.log(`  ${comImg?.nome} (${comImg?.slug}) status=${comImg?.statusObra}`);
  console.log(`  chave: ${comImg?.imagemPrincipal}`);
  if (comImg?.imagemPrincipal) {
    const url = await getUrl(comImg.imagemPrincipal);
    const r = await fetch(url);
    console.log(`  GET imagem via MinIO: HTTP ${r.status} (${r.headers.get("content-type")})`);
  }
  console.log("");
  await pool.end();
}
main().catch(async (e) => { console.error(e); try { await pool.end(); } catch {} process.exit(1); });
