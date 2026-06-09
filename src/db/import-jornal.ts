/* Importa os posts do Benx Jornal do WordPress para posts_jornal.
   Idempotente por slug. Rode: npx tsx src/db/import-jornal.ts            */
import { readFileSync, existsSync } from "node:fs";
import { extname } from "node:path";
import { carregarDump } from "@/db/wp-dump";
import { db, pool } from "@/lib/db";
import { postsJornal } from "@/db/schema";
import { uploadMidia } from "@/lib/storage";
import { eq } from "drizzle-orm";

const DUMP = "C:/Users/joaotterceiro/Local Sites/benx/app/sql/local.sql";
const UPLOADS = "C:/Users/joaotterceiro/Local Sites/benx/app/public/wp-content/uploads";

const MESES: Record<string, number> = {
  janeiro: 0, fevereiro: 1, "março": 2, marco: 2, abril: 3, maio: 4, junho: 5,
  julho: 6, agosto: 7, setembro: 8, outubro: 9, novembro: 10, dezembro: 11,
};

function parseDataBR(s: string | undefined, fallback: string | null): Date {
  // ex.: "24 de Setembro, 2025 | 06:00 AM"
  const m = (s ?? "").match(/(\d{1,2})\s+de\s+([A-Za-zçÇ]+),?\s+(\d{4})/i);
  if (m) {
    const mes = MESES[m[2].toLowerCase()];
    if (mes != null) return new Date(Number(m[3]), mes, Number(m[1]), 12);
  }
  const d = fallback ? new Date(fallback.replace(" ", "T")) : new Date();
  return isNaN(d.getTime()) ? new Date() : d;
}

function limparHtml(s: string | null | undefined): string {
  return (s ?? "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/&#8217;|&#8216;|&#039;|&rsquo;|&lsquo;/g, "'")
    .replace(/&#8220;|&#8221;|&ldquo;|&rdquo;|&quot;/g, '"')
    .replace(/&hellip;|&#8230;/g, "…").replace(/&#8211;|&#8212;|&ndash;|&mdash;/g, "–")
    .replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function contentType(p: string): string {
  const e = extname(p).toLowerCase();
  return e === ".png" ? "image/png" : e === ".webp" ? "image/webp" : e === ".gif" ? "image/gif" : "image/jpeg";
}

async function main() {
  const wp = carregarDump(DUMP);
  const posts = wp.rows("wp_posts").filter((p) => p.post_type === "post" && p.post_status === "publish");
  const meta = wp.rows("wp_postmeta");

  // meta por post
  const metaPorPost = new Map<string, Record<string, string>>();
  for (const m of meta) {
    if (!m.post_id || !m.meta_key) continue;
    const cur = metaPorPost.get(m.post_id) ?? {};
    cur[m.meta_key] = m.meta_value ?? "";
    metaPorPost.set(m.post_id, cur);
  }
  // anexos: id -> arquivo relativo
  const arquivoPorId = new Map<string, string>();
  for (const m of meta) {
    if (m.meta_key === "_wp_attached_file" && m.post_id && m.meta_value) arquivoPorId.set(m.post_id, m.meta_value);
  }
  // categoria por post
  const terms = wp.rows("wp_terms");
  const nomePorTermId = new Map(terms.map((t) => [t.term_id!, t.name!]));
  const tax = wp.rows("wp_term_taxonomy");
  const catTtIds = new Map<string, string>(); // term_taxonomy_id -> term name (só category)
  for (const t of tax) if (t.taxonomy === "category" && t.term_taxonomy_id) catTtIds.set(t.term_taxonomy_id, nomePorTermId.get(t.term_id!) ?? "");
  const rels = wp.rows("wp_term_relationships");
  const catPorPost = new Map<string, string>();
  for (const r of rels) {
    if (r.object_id && r.term_taxonomy_id && catTtIds.has(r.term_taxonomy_id)) {
      const nome = catTtIds.get(r.term_taxonomy_id)!;
      if (nome && !catPorPost.has(r.object_id)) catPorPost.set(r.object_id, nome);
    }
  }

  // destaque: a matéria da grife própria (hero do print)
  const SLUG_DESTAQUE = "benx-aposta-em-grife-propria-de-imoveis-de-luxo-pininfarina-tem-no-brasil-todo-diz-presidente";

  const cacheImg = new Map<string, string | null>();
  async function subirImagem(thumbId: string | undefined): Promise<string | null> {
    if (!thumbId) return null;
    if (cacheImg.has(thumbId)) return cacheImg.get(thumbId)!;
    const rel = arquivoPorId.get(thumbId);
    if (!rel) { cacheImg.set(thumbId, null); return null; }
    const abs = `${UPLOADS}/${rel}`;
    if (!existsSync(abs)) { cacheImg.set(thumbId, null); return null; }
    const chave = `jornal/${rel.replace(/[^a-zA-Z0-9./_-]/g, "-")}`;
    await uploadMidia(chave, readFileSync(abs), contentType(rel));
    cacheImg.set(thumbId, chave);
    return chave;
  }

  let ok = 0;
  for (const p of posts) {
    const md = metaPorPost.get(p.ID!) ?? {};
    const slug = p.post_name || `post-${p.ID}`;
    const imagem = await subirImagem(md["_thumbnail_id"]);
    const valores = {
      slug,
      titulo: limparHtml(p.post_title) || "(sem título)",
      categoria: catPorPost.get(p.ID!) || "Sem categoria",
      fonte: (md["veiculo_"] || "").trim() || null,
      fonteUrl: (md["link_da_materia_na_integra"] || "").trim() || null,
      resumo: limparHtml(p.post_excerpt) || null,
      conteudo: limparHtml(p.post_content) || null,
      imagem,
      dataPublicacao: parseDataBR(md["data_de_publicacao"], p.post_date),
      destaque: slug === SLUG_DESTAQUE,
      publicado: true,
      atualizadoEm: new Date(),
    };

    const existe = await db.query.postsJornal.findFirst({ where: eq(postsJornal.slug, slug) });
    if (existe) await db.update(postsJornal).set(valores).where(eq(postsJornal.slug, slug));
    else await db.insert(postsJornal).values(valores);
    ok += 1;
    console.log(`✓ ${slug}  [${valores.fonte ?? "—"}]  img:${imagem ? "sim" : "não"}`);
  }
  console.log(`\n${ok} posts importados.`);
  await pool.end();
}
main().catch(async (e) => { console.error(e); try { await pool.end(); } catch {} process.exit(1); });
