/* Auditoria do import: compara WP (dump) x Postgres por empreendimento.
   Usa o MESMO mapeamento do importador (wp-map.ts) para não gerar falso positivo.
   Read-only. Rode: npx tsx src/db/audit-import.ts */
import { sql, eq } from "drizzle-orm";
import { db, pool } from "@/lib/db";
import { empreendimentos, empreendimentoPlanta } from "@/db/schema";
import { criarContexto, mapear, CHAVES_CONSUMIDAS, CHAVE_LIXO } from "@/db/wp-map";
import { parseMeta } from "@/db/wp-dump";

type Tipo = "GAP" | "DIFERE" | "INCOMPLETO";
interface Issue { tipo: Tipo; campo: string; wp: string; banco: string }

const ctx = criarContexto();

async function main() {
  // estado do banco
  const rows = await db.query.empreendimentos.findMany({
    with: { cidade: true, bairro: true, categoria: true, linhaProduto: true, midias: true },
  });
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  const plantaCount = new Map<string, number>();
  for (const r of await db.select({ id: empreendimentoPlanta.empreendimentoId }).from(empreendimentoPlanta))
    plantaCount.set(r.id, (plantaCount.get(r.id) ?? 0) + 1);

  const tem = (v: unknown) => v !== null && v !== undefined && String(v).trim() !== "";
  const resultados: { nome: string; slug: string; issues: Issue[] }[] = [];
  const semNoBanco: string[] = [];
  const totais: Record<string, number> = { GAP: 0, DIFERE: 0, INCOMPLETO: 0 };

  for (const post of ctx.publicados) {
    const m = mapear(ctx, post);
    const e = bySlug.get(m.slug);
    if (!e) { semNoBanco.push(`${m.nome} (${m.slug})`); continue; }
    const issues: Issue[] = [];
    const add = (tipo: Tipo, campo: string, wp: unknown, banco: unknown) => { issues.push({ tipo, campo, wp: String(wp ?? "").slice(0, 40), banco: String(banco ?? "").slice(0, 40) }); totais[tipo]++; };

    // texto: GAP se WP tem e banco não; DIFERE se ambos têm e divergem (identidade)
    const cmpTxt = (campo: string, wp: string, banco: unknown, checaDifere = false) => {
      if (tem(wp) && !tem(banco)) add("GAP", campo, wp, banco);
      else if (checaDifere && tem(wp) && tem(banco) && wp.trim().toLowerCase() !== String(banco).trim().toLowerCase()) add("DIFERE", campo, wp, banco);
    };

    cmpTxt("nome", m.nome, e.nome, true);
    if (m.statusObra !== e.statusObra) add("DIFERE", "statusObra", m.statusObra, e.statusObra);
    if (m.linhaProduto !== e.linhaProduto?.slug) add("DIFERE", "linhaProduto", m.linhaProduto, e.linhaProduto?.slug);
    cmpTxt("cidade", m.cidadeNome, e.cidade?.nome, true);
    cmpTxt("bairro", m.bairroNome, e.bairro?.nome, true);
    cmpTxt("cep", m.cep, e.cep);
    cmpTxt("subtitulo", m.subtitulo, e.subtitulo);
    cmpTxt("oProjeto", m.oProjeto, e.oProjeto);
    cmpTxt("textoLegal", m.textoLegal, e.textoLegal);
    cmpTxt("areaConstruida", m.areaConstruidaTotal, e.areaConstruidaTotal);
    cmpTxt("metragem", m.metragemResidencial, e.metragemResidencial);
    cmpTxt("arquitetura", m.arquitetura, e.arquitetura);
    cmpTxt("paisagismo", m.paisagismo, e.paisagismo);
    cmpTxt("interiores", m.interiores, e.interiores);
    cmpTxt("areaTerreno", m.areaTerreno, e.areaTerreno);
    cmpTxt("enderecoCompleto", m.enderecoCompleto, e.enderecoCompleto);
    cmpTxt("standDeVendas", m.standDeVendas, e.standDeVendas);
    cmpTxt("linkMaps", m.linkMaps, e.linkMaps);
    cmpTxt("urlVideo", m.urlVideoPrincipal, e.urlVideoPrincipal);
    cmpTxt("vagas", m.vagas, e.vagas);
    cmpTxt("quartos", m.quartos, e.quartos);

    // contagens de repeaters JSONB
    const cnt = (a: unknown) => (Array.isArray(a) ? a.length : 0);
    const areasWp = m.areasNomeadas.length + m.areasGalAtts.filter((a) => ctx.arquivoExiste(a)).length;
    if (m.diferenciais.length !== cnt(e.diferenciais)) add(m.diferenciais.length > cnt(e.diferenciais) ? "GAP" : "DIFERE", "diferenciais", `${m.diferenciais.length}`, `${cnt(e.diferenciais)}`);
    if (m.certificacoes.length !== cnt(e.certificacoes)) add(m.certificacoes.length > cnt(e.certificacoes) ? "GAP" : "DIFERE", "certificacoes", `${m.certificacoes.length}`, `${cnt(e.certificacoes)}`);
    if (m.detalhesLocalizacao.length !== cnt(e.detalhesLocalizacao)) add(m.detalhesLocalizacao.length > cnt(e.detalhesLocalizacao) ? "GAP" : "DIFERE", "detalhesLocalizacao", `${m.detalhesLocalizacao.length}`, `${cnt(e.detalhesLocalizacao)}`);
    if (areasWp !== cnt(e.areasComuns)) add(areasWp > cnt(e.areasComuns) ? "GAP" : "DIFERE", "areasComuns", `${areasWp}`, `${cnt(e.areasComuns)}`);

    // categoria (Tipo): só GAP/ DIFERE se WP tem
    if (tem(m.categoriaSlug) && m.categoriaSlug !== e.categoria?.slug) add(e.categoria ? "DIFERE" : "GAP", "categoria(Tipo)", m.categoriaSlug, e.categoria?.slug);

    // imagem principal
    const wpImg = !!m.imagemPrincipalAtt && ctx.arquivoExiste(m.imagemPrincipalAtt);
    if (wpImg && !tem(e.imagemPrincipal)) add("GAP", "imagemPrincipal", "tem no WP", "vazio");
    if (!wpImg && !tem(e.imagemPrincipal)) add("INCOMPLETO", "imagemPrincipal", "sem", "sem");
    // logotipo (vivabenx)
    const wpLogo = !!m.logotipoAtt && ctx.arquivoExiste(m.logotipoAtt);
    if (wpLogo && !tem(e.logotipo)) add("GAP", "logotipo", "tem no WP", "vazio");

    // contagens
    const fachadaWp = m.fachadaAtts.filter((a) => ctx.arquivoExiste(a)).length;
    const fachadaDb = e.midias.filter((x) => x.tipo === "fachada").length;
    if (fachadaWp !== fachadaDb) add(fachadaWp > fachadaDb ? "GAP" : "DIFERE", "galeriaFachada", `${fachadaWp} imgs`, `${fachadaDb} imgs`);

    const plWp = m.plantaIds.length;
    const plDb = plantaCount.get(e.id) ?? 0;
    if (plWp !== plDb) add(plWp > plDb ? "GAP" : "DIFERE", "plantas", `${plWp}`, `${plDb}`);
    if (plWp === 0 && plDb === 0) add("INCOMPLETO", "plantas", "0", "0");

    if (issues.length) resultados.push({ nome: m.nome, slug: m.slug, issues });
  }

  // ── Scan: chaves do WP com dado real que o importador NÃO consome ──
  const naoMapeadas = new Map<string, number>();
  for (const post of ctx.publicados) {
    const mp = ctx.metaDe(post.ID!);
    if (!mp) continue;
    for (const [k, v] of mp) {
      if (CHAVES_CONSUMIDAS.has(k) || CHAVE_LIXO.test(k)) continue;
      const p = parseMeta(v);
      const vazio = p === null || p === "" || (Array.isArray(p) && p.length === 0) ||
        (typeof p === "object" && p !== null && Object.keys(p).length === 0) ||
        String(p).toLowerCase() === "false" || String(p) === "0";
      if (!vazio) naoMapeadas.set(k, (naoMapeadas.get(k) ?? 0) + 1);
    }
  }

  // ── Relatório ──
  console.log(`\n========== AUDITORIA IMPORT WP x BANCO ==========`);
  console.log(`Empreendimentos no WP (publicados): ${ctx.publicados.length} | no banco: ${rows.length}`);
  if (semNoBanco.length) { console.log(`\n!! NÃO ENCONTRADOS NO BANCO (${semNoBanco.length}):`); semNoBanco.forEach((s) => console.log(`   - ${s}`)); }

  const comGap = resultados.filter((r) => r.issues.some((i) => i.tipo === "GAP" || i.tipo === "DIFERE"));
  console.log(`\n===== PROBLEMAS DE IMPORT (GAP/DIFERE) — ${comGap.length} empreendimentos =====`);
  for (const r of comGap) {
    console.log(`\n• ${r.nome} (${r.slug})`);
    for (const i of r.issues.filter((x) => x.tipo !== "INCOMPLETO"))
      console.log(`    [${i.tipo}] ${i.campo}: WP="${i.wp}" | banco="${i.banco}"`);
  }

  // incompletos na origem (resumo por campo)
  const inc: Record<string, string[]> = {};
  for (const r of resultados) for (const i of r.issues.filter((x) => x.tipo === "INCOMPLETO")) (inc[i.campo] ??= []).push(r.nome);
  console.log(`\n===== INCOMPLETO NA ORIGEM (vazio no WP também) =====`);
  for (const [campo, nomes] of Object.entries(inc)) console.log(`  ${campo}: ${nomes.length} → ${nomes.slice(0, 8).join(", ")}${nomes.length > 8 ? "…" : ""}`);

  console.log(`\n===== CHAVES DO WP COM DADO, NÃO IMPORTADAS (campo existe no WP, sem destino no clone) =====`);
  const ordenadas = [...naoMapeadas.entries()].sort((a, b) => b[1] - a[1]);
  if (!ordenadas.length) console.log("  (nenhuma) — todo campo com dado tem destino no clone");
  for (const [k, n] of ordenadas) console.log(`  ${String(n).padStart(3)} emps  ${k}`);

  console.log(`\n===== TOTAIS ===== GAP=${totais.GAP} DIFERE=${totais.DIFERE} INCOMPLETO=${totais.INCOMPLETO}\n`);
  await pool.end();
}
main().catch(async (e) => { console.error(e); try { await pool.end(); } catch {} process.exit(1); });
