// ════════════════════════════════════════════════════════════════════════
// Fonte ÚNICA de verdade das vertentes (ecossistemas) Benx.
// Tudo que precisa de vertente importa daqui. A tabela linhas_produto é
// semeada a partir desta config (ver src/db/seed.ts).
//
// Extensível: para adicionar a 4ª vertente, acrescente uma entrada em VERTENTES.
// Não cravar a lista de vertentes em nenhum outro arquivo.
// ════════════════════════════════════════════════════════════════════════

export type VertenteValue = "benx_iconicos" | "benx" | "vivabenx";

export interface Vertente {
  /** chave interna e valor da FK linha_produto (ex.: "benx_iconicos") */
  value: VertenteValue;
  /** slug usado na rota pública /{slug}/... (ex.: "iconicos") */
  slug: string;
  label: string;
  nota: string;
  /** accent do ecossistema */
  cor: string;
  /** fundo suave do accent */
  bg: string;
  ordem: number;
}

export const VERTENTES: readonly Vertente[] = [
  {
    value: "benx_iconicos",
    slug: "iconicos",
    label: "Benx Icônicos",
    nota: "Alto padrão",
    cor: "#7A5C1E",
    bg: "rgba(122,92,30,0.10)",
    ordem: 1,
  },
  {
    value: "benx",
    slug: "benx",
    label: "Benx",
    nota: "Médio padrão",
    cor: "#0A4DCC",
    bg: "rgba(10,77,204,0.10)",
    ordem: 2,
  },
  {
    value: "vivabenx",
    slug: "vivabenx",
    label: "VivaBenx",
    nota: "Econômico (HIS/HMP)",
    cor: "#2E9E54",
    bg: "rgba(46,158,84,0.12)",
    ordem: 3,
  },
] as const;

/** Lista ordenada das vertentes. */
export function listarVertentes(): Vertente[] {
  return [...VERTENTES].sort((a, b) => a.ordem - b.ordem);
}

/** Resolve vertente pelo slug de rota (ex.: "unicos"). */
export function vertentePorSlug(slug: string): Vertente | undefined {
  return VERTENTES.find((v) => v.slug === slug);
}

/** Resolve vertente pelo value/FK (ex.: "benx_unicos"). */
export function vertentePorValue(value: string): Vertente | undefined {
  return VERTENTES.find((v) => v.value === value);
}

/** True se o slug corresponde a uma vertente válida. */
export function isVertenteSlug(slug: string): boolean {
  return VERTENTES.some((v) => v.slug === slug);
}
