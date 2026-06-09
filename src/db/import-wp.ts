/* Importador WordPress/JetEngine -> Postgres + MinIO.
   Mapeamento em wp-map.ts (fonte única). Aqui: resolve uploads e persiste.

   Uso:
     npx tsx src/db/import-wp.ts            # importa tudo (publicados)
     npx tsx src/db/import-wp.ts --dry      # só valida mapeamento, não grava
     npx tsx src/db/import-wp.ts --limit=3  # só os N primeiros (teste)
*/
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { db, pool } from "@/lib/db";
import { empreendimentos } from "@/db/schema";
import { criarContexto, mapear, mapearPlanta, ctype, UPLOADS, type Ctx } from "@/db/wp-map";
import { persistirEmpreendimento, type SalvarPayload, type PlantaPayload } from "@/lib/empreendimento-service";
import { uploadMidia } from "@/lib/storage";

const DRY = process.argv.includes("--dry");
const SKIP_MEDIA = process.argv.includes("--skip-media"); // reusa chaves já no MinIO (não re-sobe)
const LIMIT = Number((process.argv.find((a) => a.startsWith("--limit=")) ?? "").split("=")[1]) || Infinity;

const ctx = criarContexto();
const cacheMidia = new Map<string, string | null>();
const stats = { emp: 0, ok: 0, falha: 0, plantas: 0, imgOk: 0, imgFalta: 0 };
const faltando: string[] = [];

async function subir(att: string | null | undefined): Promise<string | null> {
  if (!att || !/^\d+$/.test(att)) return null;
  if (cacheMidia.has(att)) return cacheMidia.get(att)!;
  const rel = ctx.arquivoDe(att);
  if (!rel) { cacheMidia.set(att, null); return null; }
  const abs = join(UPLOADS, ...rel.split("/"));
  if (!ctx.arquivoExiste(att)) { stats.imgFalta++; faltando.push(rel); cacheMidia.set(att, null); return null; }
  const chave = "wp/" + rel;
  if (!DRY && !SKIP_MEDIA) {
    try { await uploadMidia(chave, readFileSync(abs), ctype(rel)); }
    catch (e) { console.warn(`  ! upload ${rel}: ${(e as Error).message}`); cacheMidia.set(att, null); return null; }
  }
  stats.imgOk++; cacheMidia.set(att, chave); return chave;
}
async function subirLista(atts: string[]): Promise<string[]> {
  const out: string[] = [];
  for (const a of atts) { const k = await subir(a); if (k) out.push(k); }
  return out;
}

async function montarPayload(ctx: Ctx, post: Parameters<typeof mapear>[1]): Promise<SalvarPayload> {
  const m = mapear(ctx, post);
  // plantas
  const plantas: PlantaPayload[] = [];
  for (const pid of m.plantaIds) {
    const mp = mapearPlanta(ctx, pid, m.nome); if (!mp) continue;
    plantas.push({ nome: mp.nome, metragem: mp.metragem, dormitorios: mp.dormitorios, suites: mp.suites, vagas: mp.vagas, recursos: mp.recursos, imagem: await subir(mp.thumbAtt) });
    stats.plantas++;
  }
  // áreas comuns: nomeadas + galeria flat
  const areasComuns: { nome: string; descricao?: string; imagem?: string }[] = [...m.areasNomeadas];
  const galAreas = await subirLista(m.areasGalAtts);
  galAreas.forEach((k, i) => areasComuns.push({ nome: `Área comum ${i + 1}`, imagem: k }));
  // certificações
  const certificacoes: { nome: string; imagem?: string }[] = [];
  for (const c of m.certificacoes) { const img = await subir(c.logoAtt); certificacoes.push(img ? { nome: c.nome, imagem: img } : { nome: c.nome }); }

  return {
    nome: m.nome, slug: m.slug, subtitulo: m.subtitulo,
    linhaProduto: m.linhaProduto as SalvarPayload["linhaProduto"],
    categoriaSlug: m.categoriaSlug, tipoHabitacao: m.tipoHabitacao as SalvarPayload["tipoHabitacao"],
    statusObra: m.statusObra, previsaoEntrega: m.previsaoEntrega,
    oProjeto: m.oProjeto, arquitetura: m.arquitetura, paisagismo: m.paisagismo, interiores: m.interiores,
    totalUnidades: m.totalUnidades, totalAndares: m.totalAndares, unidadesPorAndar: m.unidadesPorAndar, numeroTorres: m.numeroTorres,
    areaTerreno: m.areaTerreno, areaConstruidaTotal: m.areaConstruidaTotal,
    metragemResidencial: m.metragemResidencial, metragemNr: m.metragemNr, quartos: m.quartos, vagas: m.vagas, textoLegal: m.textoLegal,
    enderecoParcial: m.enderecoParcial, enderecoCompleto: m.enderecoCompleto, cep: m.cep,
    cidadeNome: m.cidadeNome, cidadeUf: m.cidadeUf, bairroNome: m.bairroNome,
    enderecoVendas: m.enderecoVendas, standDeVendas: m.standDeVendas,
    linkUber: m.linkUber, linkMaps: m.linkMaps, linkWaze: m.linkWaze,
    imagemPrincipal: (await subir(m.imagemPrincipalAtt)) ?? undefined,
    logotipo: (await subir(m.logotipoAtt)) ?? undefined,
    urlVideoPrincipal: m.urlVideoPrincipal,
    thumbnailVideo: (await subir(m.thumbnailVideoAtt)) ?? undefined,
    urlTourVirtual: m.urlTourVirtual, vistasDoAndar: m.vistasDoAndar,
    obraFundacao: m.obraFundacao, obraAlvenaria: m.obraAlvenaria, obraAcabamento: m.obraAcabamento, obraTotal: m.obraTotal,
    obraDocumentacao: m.obraDocumentacao, obraAtualizadaEm: m.obraAtualizadaEm, redirecionarPara: m.redirecionarPara,
    visivel: m.visivel, exibirObras: m.exibirObras, exibirPlantas: m.exibirPlantas, exibirLocalizacao: m.exibirLocalizacao, modoBreveLancamento: m.modoBreveLancamento,
    diferenciais: m.diferenciais, areasComuns, certificacoes, detalhesLocalizacao: m.detalhesLocalizacao, tagsCard: m.tagsCard, relacionados: m.relacionadosSlugs,
    plantas,
    galeriaFachada: await subirLista(m.fachadaAtts),
    galeriaObra: await subirLista(m.obraAtts),
  } as SalvarPayload;
}

async function main() {
  console.log(`\n=== IMPORT WP -> Postgres+MinIO ${DRY ? "(DRY RUN)" : ""} ===`);
  const lista = ctx.publicados.slice(0, LIMIT === Infinity ? undefined : LIMIT);
  console.log(`Empreendimentos a importar: ${lista.length}\n`);

  for (const post of lista) {
    stats.emp++;
    let payload: SalvarPayload;
    try { payload = await montarPayload(ctx, post); }
    catch (e) { stats.falha++; console.log(`  ✗ ${post.post_title}: montar falhou: ${(e as Error).message}`); continue; }
    const linha = `[${payload.linhaProduto}] ${payload.nome} (${payload.slug}) · status=${payload.statusObra} · plantas=${payload.plantas.length} · fachada=${payload.galeriaFachada.length} · areas=${payload.areasComuns?.length ?? 0}`;
    if (DRY) { stats.ok++; console.log(`  ~ ${linha}`); continue; }
    const existente = await db.query.empreendimentos.findFirst({ where: eq(empreendimentos.slug, payload.slug), columns: { id: true } });
    const res = await persistirEmpreendimento(existente?.id ?? null, payload);
    if (res.ok) { stats.ok++; console.log(`  ✓ ${existente ? "upd" : "new"} ${linha}`); }
    else { stats.falha++; console.log(`  ✗ ${payload.nome}: ${res.erro}${res.campos ? " " + JSON.stringify(res.campos) : ""}`); }
  }

  console.log(`\n=== RESUMO ===`);
  console.log(`  empreendimentos: ${stats.ok}/${stats.emp} ok, ${stats.falha} falha`);
  console.log(`  plantas: ${stats.plantas} · imagens: ${stats.imgOk} enviadas, ${stats.imgFalta} ausente`);
  if (faltando.length) console.log(`  (ausentes ex.: ${[...new Set(faltando)].slice(0, 5).join(", ")})`);
  console.log("");
  await pool.end();
  process.exit(stats.falha > 0 ? 1 : 0);
}
main().catch(async (e) => { console.error("ERRO:", e); try { await pool.end(); } catch {} process.exit(1); });
