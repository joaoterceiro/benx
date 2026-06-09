import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { VERTENTES } from "@/lib/ecossistema";
import { cardsVertente, listarPostsPublicos } from "@/db/queries";
import { logger } from "@/lib/logger";

// Revalida o sitemap a cada 1h.
export const revalidate = 3600;

const ROTAS_ESTATICAS = [
  "",
  "/origem-proposito",
  "/mentes-criativas",
  "/portal-do-cliente",
  "/atendimento",
  "/vendas",
  "/canal-de-etica",
  "/trabalhe-conosco",
  "/assessoria-de-imprensa",
  "/venda-seu-terreno",
  "/sou-vizinho",
  "/corretores-e-imobiliarias",
  "/benx-journal",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const agora = new Date();
  const itens: MetadataRoute.Sitemap = ROTAS_ESTATICAS.map((r) => ({
    url: `${SITE_URL}${r}`,
    lastModified: agora,
    changeFrequency: "weekly",
    priority: r === "" ? 1 : 0.7,
  }));

  // Homes das vertentes + empreendimentos de cada uma.
  try {
    for (const v of VERTENTES) {
      itens.push({ url: `${SITE_URL}/${v.slug}`, lastModified: agora, changeFrequency: "weekly", priority: 0.8 });
      const cards = await cardsVertente(v.value);
      for (const c of cards) {
        itens.push({ url: `${SITE_URL}/${v.slug}/${c.slug}`, lastModified: agora, changeFrequency: "monthly", priority: 0.6 });
      }
    }
  } catch (err) { logger.warn({ err, action: "sitemap_empreendimentos" }, "sitemap sem empreendimentos (banco ausente)"); }

  // Posts do Benx Journal.
  try {
    const posts = await listarPostsPublicos();
    for (const p of posts) {
      itens.push({ url: `${SITE_URL}/benx-journal/${p.slug}`, lastModified: agora, changeFrequency: "monthly", priority: 0.5 });
    }
  } catch (err) { logger.warn({ err, action: "sitemap_posts" }, "sitemap sem posts"); }

  return itens;
}
