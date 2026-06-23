// Helpers para a imagem dos "pontos de interesse próximos" (detalhesLocalizacao).
// Suporta três formatos:
//  - chave MinIO (uploads feitos no admin novo);
//  - URL absoluta (imagens migradas do WordPress);
//  - formato legado da migração, onde a imagem (objeto ACF) caiu no campo
//    `distancia` como objeto { url, sizes, ... }.

type PontoBruto = { titulo?: unknown; distancia?: unknown; imagem?: unknown };

const ehUrl = (s: string) => /^https?:\/\//i.test(s);

function urlEmObjeto(o: Record<string, unknown>): string | null {
  if (typeof o.url === "string" && ehUrl(o.url)) return o.url;
  const sizes = o.sizes;
  if (sizes && typeof sizes === "object") {
    for (const k of ["large", "medium_large", "medium", "thumbnail"]) {
      const v = (sizes as Record<string, unknown>)[k];
      if (typeof v === "string" && ehUrl(v)) return v;
    }
  }
  for (const v of Object.values(o)) {
    if (typeof v === "string" && ehUrl(v) && /\.(jpe?g|png|webp|gif|avif)/i.test(v)) return v;
  }
  return null;
}

/**
 * Chave/URL da imagem do ponto, ou null. Pode retornar uma chave MinIO (resolver
 * com getUrl) ou uma URL absoluta (usar direto). Ignora o lixo "[object Object]".
 */
export function chaveImagemPonto(p: PontoBruto | null | undefined): string | null {
  if (!p) return null;
  const cand = p.imagem ?? p.distancia;
  if (!cand) return null;
  if (typeof cand === "string") {
    const s = cand.trim();
    return s && s !== "[object Object]" ? s : null;
  }
  if (typeof cand === "object") return urlEmObjeto(cand as Record<string, unknown>);
  return null;
}
