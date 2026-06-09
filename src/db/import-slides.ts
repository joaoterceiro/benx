/* Importa os hero slides do WordPress (CPT benx_slide) para hero_slides.
   Idempotente: limpa e reimporta. Rode: npx tsx src/db/import-slides.ts     */
import { readFileSync, existsSync } from "node:fs";
import { extname } from "node:path";
import { carregarDump, phpUnserialize } from "@/db/wp-dump";
import { db, pool } from "@/lib/db";
import { heroSlides } from "@/db/schema";
import { uploadMidia } from "@/lib/storage";

const DUMP = "C:/Users/joaotterceiro/Local Sites/benx/app/sql/local.sql";
const UPLOADS = "C:/Users/joaotterceiro/Local Sites/benx/app/public/wp-content/uploads";

// taxonomia "Exibir em" -> vertente value
const LOCAL_PARA_VERTENTE: Record<string, string> = {
  "home-icones-benx": "benx_iconicos",
  "home-benx": "benx",
  "home-vivabenx": "vivabenx",
};

function contentType(p: string): string {
  const e = extname(p).toLowerCase();
  return e === ".png" ? "image/png" : e === ".webp" ? "image/webp" : e === ".gif" ? "image/gif" : "image/jpeg";
}

async function main() {
  const wp = carregarDump(DUMP);
  const posts = wp.rows("wp_posts").filter((p) => p.post_type === "benx_slide" && p.post_status === "publish");
  const meta = wp.rows("wp_postmeta");

  const metaPorPost = new Map<string, Record<string, string>>();
  const arquivoPorId = new Map<string, string>();
  for (const m of meta) {
    if (!m.post_id || !m.meta_key) continue;
    const c = metaPorPost.get(m.post_id) ?? {}; c[m.meta_key] = m.meta_value ?? ""; metaPorPost.set(m.post_id, c);
    if (m.meta_key === "_wp_attached_file" && m.meta_value) arquivoPorId.set(m.post_id, m.meta_value);
  }

  // locais por post (taxonomia benx_slide_location)
  const terms = wp.rows("wp_terms");
  const slugPorTermId = new Map(terms.map((t) => [t.term_id!, t.slug!]));
  const tax = wp.rows("wp_term_taxonomy");
  const ttToSlug = new Map<string, string>();
  for (const t of tax) if (t.taxonomy === "benx_slide_location" && t.term_taxonomy_id) ttToSlug.set(t.term_taxonomy_id, slugPorTermId.get(t.term_id!) ?? "");
  const rels = wp.rows("wp_term_relationships");
  const locaisPorPost = new Map<string, string[]>();
  for (const r of rels) {
    if (r.object_id && r.term_taxonomy_id && ttToSlug.has(r.term_taxonomy_id)) {
      const arr = locaisPorPost.get(r.object_id) ?? [];
      arr.push(ttToSlug.get(r.term_taxonomy_id)!);
      locaisPorPost.set(r.object_id, arr);
    }
  }

  const cacheImg = new Map<string, string | null>();
  async function subir(thumbId: string | undefined): Promise<string | null> {
    if (!thumbId) return null;
    if (cacheImg.has(thumbId)) return cacheImg.get(thumbId)!;
    const rel = arquivoPorId.get(thumbId);
    if (!rel) { cacheImg.set(thumbId, null); return null; }
    const abs = `${UPLOADS}/${rel}`;
    if (!existsSync(abs)) { cacheImg.set(thumbId, null); return null; }
    const chave = `slides/${rel.replace(/[^a-zA-Z0-9./_-]/g, "-")}`;
    await uploadMidia(chave, readFileSync(abs), contentType(rel));
    cacheImg.set(thumbId, chave);
    return chave;
  }

  await db.delete(heroSlides);

  let n = 0;
  for (const s of posts) {
    const md = metaPorPost.get(s.ID!) ?? {};
    if (md["_benx_slide_active"] === "0") continue;
    const locais = (locaisPorPost.get(s.ID!) ?? []).map((l) => LOCAL_PARA_VERTENTE[l]).filter(Boolean);
    const vertentes = [...new Set(locais)];
    if (vertentes.length === 0) continue;

    const imagem = await subir(md["_thumbnail_id"]);
    if (!imagem) continue; // slide sem imagem não entra

    let tags: string[] = [];
    const raw = md["_benx_slide_tags"];
    if (raw) {
      try { const p = phpUnserialize(raw); if (Array.isArray(p)) tags = p.map((x) => String(x)).filter(Boolean); } catch { /* ignore */ }
    }

    await db.insert(heroSlides).values({
      locais: vertentes,
      titulo: s.post_title || "Slide",
      imagem,
      videoUrl: (md["_benx_slide_video_url"] || "").trim() || null,
      link: (md["_benx_slide_link"] || "").trim() || null,
      botaoTexto: (md["_benx_slide_btn_text"] || "").trim() || "Conheça",
      tags,
      ordem: parseInt(md["_benx_slide_order"] || "0", 10) || 0,
      ativo: true,
    });
    n += 1;
    console.log(`✓ "${s.post_title}" -> ${vertentes.join(", ")} | tags:${tags.length}`);
  }
  console.log(`\n${n} slides importados.`);
  await pool.end();
}
main().catch(async (e) => { console.error(e); try { await pool.end(); } catch {} process.exit(1); });
