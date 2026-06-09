/* Smoke: valores customizados em tipo/status/habitação ponta a ponta.
   Rode: npx tsx src/db/smoke-criavel.ts */
import { eq, like } from "drizzle-orm";
import { db, pool } from "@/lib/db";
import { empreendimentos, categorias, plantas } from "@/db/schema";
import { persistirEmpreendimento, type SalvarPayload } from "@/lib/empreendimento-service";

let passou = 0, falhou = 0;
const ok = (c: boolean, m: string) => (c ? (passou++, console.log(`  ✓ ${m}`)) : (falhou++, console.log(`  ✗ FALHOU: ${m}`)));

const SLUG = `smoke-criavel-${Date.now().toString(36)}`;
const CAT = "loteamento"; // categoria nova (não existe no seed)

const payload = (): SalvarPayload => ({
  nome: "Smoke Criável", slug: SLUG, subtitulo: "",
  linhaProduto: "benx",
  categoriaSlug: CAT,            // tipo novo -> deve auto-criar categoria
  tipoHabitacao: "estudantil",  // habitação customizada (texto livre)
  statusObra: "pre_lancamento", // status customizado (texto livre)
  previsaoEntrega: "",
  oProjeto: "", arquitetura: "", paisagismo: "", interiores: "",
  totalUnidades: "", totalAndares: "", unidadesPorAndar: "", numeroTorres: "",
  areaTerreno: "", areaConstruidaTotal: "", metragemResidencial: "",
  quartos: "", vagas: "", textoLegal: "",
  enderecoParcial: "", enderecoCompleto: "", cep: "",
  cidadeNome: "Cidade Smoke", cidadeUf: "SP", bairroNome: "Bairro Smoke",
  enderecoVendas: "", standDeVendas: "", linkUber: "", linkMaps: "", linkWaze: "",
  imagemPrincipal: undefined, logotipo: undefined,
  urlVideoPrincipal: "", urlTourVirtual: "", vistasDoAndar: "",
  obraFundacao: 0, obraAlvenaria: 0, obraAcabamento: 0, obraTotal: 0,
  obraDocumentacao: "", obraAtualizadaEm: "", redirecionarPara: "",
  visivel: true, exibirObras: false, exibirPlantas: false, exibirLocalizacao: false, modoBreveLancamento: false,
  diferenciais: [], areasComuns: [], certificacoes: [], detalhesLocalizacao: [], tagsCard: [],
  plantas: [], galeriaFachada: [], galeriaObra: [],
});

async function main() {
  console.log("\n=== SMOKE: valores customizados nos selects ===\n");
  const c = await persistirEmpreendimento(null, payload());
  ok(c.ok, "persistir (criar) com valores customizados retornou ok");
  if (!c.ok) return fim();

  const e = await db.query.empreendimentos.findFirst({
    where: eq(empreendimentos.id, c.id),
    with: { categoria: true },
  });
  ok(e?.statusObra === "pre_lancamento", `statusObra customizado persistido (got ${e?.statusObra})`);
  ok(e?.tipoHabitacao === "estudantil", `tipoHabitacao customizado persistido (got ${e?.tipoHabitacao})`);
  ok(e?.categoria?.slug === CAT, `categoria nova auto-criada e vinculada (got ${e?.categoria?.slug})`);
  ok(e?.categoria?.nome === "Loteamento", `categoria nova com nome humanizado (got ${e?.categoria?.nome})`);

  // limpeza
  await db.delete(empreendimentos).where(eq(empreendimentos.id, c.id));
  await db.delete(categorias).where(eq(categorias.slug, CAT));
  await db.delete(plantas).where(like(plantas.slug, `${SLUG}%`));
  const sumiu = await db.query.empreendimentos.findFirst({ where: eq(empreendimentos.id, c.id) });
  ok(!sumiu, "cleanup do empreendimento");
  await fim();
}
async function fim() {
  console.log(`\n=== RESULTADO: ${passou} passaram, ${falhou} falharam ===\n`);
  await pool.end();
  process.exit(falhou > 0 ? 1 : 0);
}
main().catch(async (err) => { console.error("ERRO:", err); try { await pool.end(); } catch {} process.exit(1); });
