/* Semeia o menu overlay (estrutura do WP, com submenus). Idempotente.
   Rode: npx tsx src/db/seed-menu.ts */
import { db, pool } from "@/lib/db";
import { menuItens } from "@/db/schema";

type No = { texto: string; url: string; filhos?: { texto: string; url: string }[] };

const ARVORE: No[] = [
  { texto: "Home", url: "/" },
  { texto: "Origem e Propósito", url: "/origem-proposito" },
  { texto: "Cliente", url: "/portal-do-cliente" },
  { texto: "Mentes Criativas", url: "/mentes-criativas" },
  { texto: "Parque Global", url: "/parque-global" },
  { texto: "Empreendimentos Benx", url: "/benx" },
  { texto: "Ícones Benx", url: "/iconicos" },
  { texto: "Viva Benx", url: "/vivabenx" },
  {
    texto: "Fale com a Benx", url: "#",
    filhos: [
      { texto: "Atendimento", url: "/atendimento" },
      { texto: "Vendas", url: "/vendas" },
      { texto: "Corretores e Imobiliárias", url: "/corretores-e-imobiliarias" },
      { texto: "Trabalhe Conosco", url: "/trabalhe-conosco" },
    ],
  },
  { texto: "Benx Journal", url: "/benx-journal" },
  {
    texto: "Compromisso com o Futuro", url: "#",
    filhos: [
      { texto: "Compromisso com o futuro", url: "/compromisso-com-o-futuro" },
      { texto: "A Benx", url: "/esg/a-benx" },
      { texto: "Excelência dos empreendimentos", url: "/esg/excelencia" },
      { texto: "Gente e gestão de stakeholders", url: "/esg/gente" },
      { texto: "Construção sustentável", url: "/esg/construcao" },
      { texto: "Transparência e prestação de contas", url: "/esg/transparencia" },
    ],
  },
];

async function main() {
  const existentes = await db.select().from(menuItens);
  if (existentes.length > 0) {
    console.log(`Menu já tem ${existentes.length} itens; nada a semear.`);
    await pool.end();
    return;
  }
  let ordem = 0;
  for (const no of ARVORE) {
    const [pai] = await db.insert(menuItens).values({ texto: no.texto, url: no.url, ordem: ordem++, ativo: true }).returning({ id: menuItens.id });
    for (const f of no.filhos ?? []) {
      await db.insert(menuItens).values({ texto: f.texto, url: f.url, ordem: ordem++, parentId: pai.id, ativo: true });
    }
  }
  console.log("Menu semeado (estrutura WP).");
  await pool.end();
}
main().catch(async (e) => { console.error(e); try { await pool.end(); } catch {} process.exit(1); });
