// Otimiza as imagens dos slides do hero: resize para no máximo 1920px de largura
// e re-encoda em WebP q72. png/jpg viram .webp (o original é removido). Os slides
// são o LCP das homes; isso corta o peso drasticamente.
import { readdir, stat, rm, rename } from "node:fs/promises";
import { join, extname } from "node:path";
import sharp from "sharp";

const ROOT = "public/slides";

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

const files = await walk(ROOT);
let antes = 0, depois = 0;
for (const f of files) {
  const ext = extname(f).toLowerCase();
  if (![".webp", ".png", ".jpg", ".jpeg"].includes(ext)) continue;
  const szAntes = (await stat(f)).size;
  antes += szAntes;
  const destino = ext === ".webp" ? f : f.replace(/\.(png|jpe?g)$/i, ".webp");
  const buf = await sharp(f)
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 72 })
    .toBuffer();
  const tmp = destino + ".tmp";
  await sharp(buf).toFile(tmp);
  const szDepois = (await stat(tmp)).size;
  depois += szDepois;
  console.log(`${(szAntes / 1024).toFixed(0)}KB -> ${(szDepois / 1024).toFixed(0)}KB  ${destino}`);
}
console.log(`TOTAL: ${(antes / 1048576).toFixed(2)}MB -> ${(depois / 1048576).toFixed(2)}MB`);
