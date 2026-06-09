/* Teste de integração do cadastro: exercita o núcleo de persistência real
   contra Postgres + MinIO. Cria, lê, edita (replace de plantas/galerias),
   lê de novo, valida storage e limpa. Rode: npx tsx src/db/test-cadastro.ts */
import { eq, and, like } from "drizzle-orm";
import { db, pool } from "@/lib/db";
import { empreendimentos, empreendimentoPlanta, midias, plantas } from "@/db/schema";
import { persistirEmpreendimento, type SalvarPayload } from "@/lib/empreendimento-service";
import { uploadMidia, getUrl, deleteMidia } from "@/lib/storage";

let passou = 0;
let falhou = 0;
function ok(cond: boolean, msg: string) {
  if (cond) { passou++; console.log(`  ✓ ${msg}`); }
  else { falhou++; console.log(`  ✗ FALHOU: ${msg}`); }
}

const SLUG = `test-cad-${Date.now().toString(36)}`;

function base(): SalvarPayload {
  return {
    nome: "Teste Cadastro", slug: SLUG, subtitulo: "sub",
    linhaProduto: "benx", categoriaSlug: "residencial", tipoHabitacao: "his_e_hmp",
    statusObra: "em_construcao", previsaoEntrega: "2026-06",
    oProjeto: "projeto", arquitetura: "arq", paisagismo: "pais", interiores: "int",
    totalUnidades: "100", totalAndares: "10", unidadesPorAndar: "4", numeroTorres: "2",
    areaTerreno: "5000", areaConstruidaTotal: "12000", metragemResidencial: "48 a 72",
    quartos: "2 e 3", vagas: "1 e 2", textoLegal: "legal",
    enderecoParcial: "Rua X", enderecoCompleto: "Rua X, 100", cep: "13010-000",
    cidadeNome: "Campinas Teste", cidadeUf: "SP", bairroNome: "Cambuí Teste",
    enderecoVendas: "", standDeVendas: "", linkUber: "", linkMaps: "", linkWaze: "",
    imagemPrincipal: undefined, logotipo: undefined,
    urlVideoPrincipal: "", urlTourVirtual: "", vistasDoAndar: "",
    obraFundacao: 100, obraAlvenaria: 70, obraAcabamento: 30, obraTotal: 50,
    obraDocumentacao: "Aprovada", obraAtualizadaEm: "", redirecionarPara: "",
    visivel: true, exibirObras: true, exibirPlantas: true, exibirLocalizacao: true, modoBreveLancamento: false,
    diferenciais: ["Piscina", "Academia"],
    areasComuns: [{ nome: "Rooftop", descricao: "vista" }],
    certificacoes: [{ nome: "LEED Gold" }],
    detalhesLocalizacao: [{ titulo: "Shopping", distancia: "500 m" }],
    tagsCard: [],
    plantas: [
      { nome: "2 dorms", metragem: "52", dormitorios: "2", suites: "1", vagas: "1", recursos: ["Varanda"], imagem: null },
      { nome: "3 dorms", metragem: "72", dormitorios: "3", suites: "1", vagas: "2", recursos: [], imagem: null },
    ],
    galeriaFachada: ["test/fachada-1.jpg", "test/fachada-2.jpg"],
    galeriaObra: ["test/obra-1.jpg"],
  };
}

async function contarPlantas(empId: string) {
  const v = await db.select({ pid: empreendimentoPlanta.plantaId }).from(empreendimentoPlanta).where(eq(empreendimentoPlanta.empreendimentoId, empId));
  return v.length;
}
async function contarMidias(empId: string, tipo: "fachada" | "obra") {
  const v = await db.select().from(midias).where(and(eq(midias.empreendimentoId, empId), eq(midias.tipo, tipo)));
  return v.length;
}

async function main() {
  console.log("\n=== TESTE DE INTEGRAÇÃO: CADASTRO ===\n");

  // 1. CRIAR
  console.log("1. Criar empreendimento");
  const c = await persistirEmpreendimento(null, base());
  ok(c.ok, "persistir (criar) retornou ok");
  if (!c.ok) { await fim(); return; }
  const id = c.id;

  const e1 = await db.query.empreendimentos.findFirst({
    where: eq(empreendimentos.id, id),
    with: { cidade: true, bairro: true, categoria: true, linhaProduto: true },
  });
  ok(!!e1, "empreendimento existe no banco");
  ok(e1?.nome === "Teste Cadastro", "nome persistido");
  ok(e1?.statusObra === "em_construcao", "statusObra persistido");
  ok(String(e1?.previsaoEntrega) === "2026-06-01", `previsão mês→data (got ${e1?.previsaoEntrega})`);
  ok(e1?.obraTotal === 50, "obraTotal persistido");
  ok(e1?.obraDocumentacao === "Aprovada", "obraDocumentacao (coluna nova) persistida");
  ok(e1?.categoria?.slug === "residencial", "categoria resolvida (tipo→categoria)");
  ok(e1?.linhaProduto?.slug === "benx", "vertente resolvida");
  ok(e1?.cidade?.nome === "Campinas Teste", "cidade resolve-or-create");
  ok(e1?.cidade?.estado === "SP", "UF da cidade nova");
  ok(e1?.bairro?.nome === "Cambuí Teste", "bairro resolve-or-create");
  ok((e1?.diferenciais?.length ?? 0) === 2, "diferenciais (JSONB) = 2");
  ok((e1?.areasComuns?.length ?? 0) === 1 && (e1?.areasComuns as { nome: string }[])[0]?.nome === "Rooftop", "areasComuns objeto persistido");
  ok((e1?.certificacoes?.length ?? 0) === 1, "certificacoes persistidas");
  ok((e1?.detalhesLocalizacao?.length ?? 0) === 1, "detalhesLocalizacao persistido");
  ok((await contarPlantas(id)) === 2, "2 plantas vinculadas");
  ok((await contarMidias(id, "fachada")) === 2, "2 mídias fachada");
  ok((await contarMidias(id, "obra")) === 1, "1 mídia obra");

  // 2. STORAGE round-trip (MinIO)
  console.log("2. Storage MinIO (upload + URL assinada + GET)");
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");
  const chave = `test/roundtrip-${Date.now().toString(36)}.png`;
  await uploadMidia(chave, png, "image/png");
  const url = await getUrl(chave);
  const resp = await fetch(url);
  ok(resp.status === 200, `objeto recuperável via URL assinada (HTTP ${resp.status})`);
  await deleteMidia(chave);

  // 3. EDITAR (replace de plantas e galerias)
  console.log("3. Editar (replace de plantas/galerias)");
  const ed = base();
  ed.nome = "Teste Cadastro EDITADO";
  ed.obraTotal = 80;
  ed.plantas = [{ nome: "Studio", metragem: "32", dormitorios: "1", suites: "0", vagas: "1", recursos: ["Compacto"], imagem: null }];
  ed.galeriaFachada = [];
  ed.galeriaObra = ["test/obra-2.jpg", "test/obra-3.jpg"];
  const u = await persistirEmpreendimento(id, ed);
  ok(u.ok, "persistir (editar) retornou ok");

  const e2 = await db.query.empreendimentos.findFirst({ where: eq(empreendimentos.id, id) });
  ok(e2?.nome === "Teste Cadastro EDITADO", "nome atualizado");
  ok(e2?.obraTotal === 80, "obraTotal atualizado");
  ok((await contarPlantas(id)) === 1, "plantas substituídas (2 → 1)");
  ok((await contarMidias(id, "fachada")) === 0, "galeria fachada limpa (2 → 0)");
  ok((await contarMidias(id, "obra")) === 2, "galeria obra substituída (1 → 2)");

  // 4. LIMPEZA
  console.log("4. Limpeza");
  const pids = await db.select({ pid: empreendimentoPlanta.plantaId }).from(empreendimentoPlanta).where(eq(empreendimentoPlanta.empreendimentoId, id));
  await db.delete(empreendimentos).where(eq(empreendimentos.id, id)); // cascade: midias + junção
  for (const { pid } of pids) await db.delete(plantas).where(eq(plantas.id, pid));
  await db.delete(plantas).where(like(plantas.slug, `${SLUG}%`));
  const sumiu = await db.query.empreendimentos.findFirst({ where: eq(empreendimentos.id, id) });
  ok(!sumiu, "empreendimento removido (cleanup)");

  await fim();
}

async function fim() {
  console.log(`\n=== RESULTADO: ${passou} passaram, ${falhou} falharam ===\n`);
  await pool.end();
  process.exit(falhou > 0 ? 1 : 0);
}

main().catch(async (err) => {
  console.error("ERRO NÃO TRATADO:", err);
  try { await pool.end(); } catch {}
  process.exit(1);
});
