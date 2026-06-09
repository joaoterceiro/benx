import "server-only";
import sanitizeHtml from "sanitize-html";

// Sanitiza HTML rico (Benx Journal) antes de renderizar/gravar.
// Allowlist: remove <script>, handlers on*=, javascript: e iframes de hosts
// não confiáveis. Cobre tanto conteúdo do editor quanto o importado do WP.
const OPCOES: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "img", "h1", "h2", "figure", "figcaption", "iframe", "span",
  ]),
  allowedAttributes: {
    a: ["href", "name", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    iframe: ["src", "width", "height", "allow", "allowfullscreen", "frameborder", "title"],
    span: ["style"],
    "*": ["style"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https", "data"] },
  allowedIframeHostnames: ["www.youtube.com", "youtube.com", "youtube-nocookie.com", "player.vimeo.com"],
  // força rel seguro em links externos
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }, true),
  },
  // permite só um subconjunto de propriedades de estilo (evita CSS perigoso)
  allowedStyles: {
    "*": {
      "text-align": [/^left$|^right$|^center$|^justify$/],
      "color": [/^#[0-9a-fA-F]{3,8}$/, /^rgb\(/, /^rgba\(/],
      "background-color": [/^#[0-9a-fA-F]{3,8}$/, /^rgb\(/, /^rgba\(/],
      "font-weight": [/^\d+$|^bold$|^normal$/],
    },
  },
};

export function sanitizarHtml(sujo: string): string {
  return sanitizeHtml(sujo ?? "", OPCOES);
}
