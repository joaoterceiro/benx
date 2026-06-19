// Selo de habitação (Prefeitura de SP) — mapeamento de tipo -> imagem e config
// global de posicionamento na card. Módulo PURO (sem db): usável no client e no
// server. A leitura da config (db) fica em config.ts (lerSeloConfig).

export const SELO_POR_TIPO: Record<string, string> = {
  his: "/selos/his.jpg",
  his_2: "/selos/his-2.jpg",
  hmp: "/selos/hmp.jpg",
  his_e_hmp: "/selos/his-hmp.jpg",
};

export function seloUrlPorTipo(tipo?: string | null): string | null {
  if (!tipo) return null;
  return SELO_POR_TIPO[tipo] ?? null;
}

export type SeloPosicao = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export interface SeloConfig {
  ativo: boolean; // liga/desliga a exibição do selo nas cards
  posicao: SeloPosicao;
  tamanho: number; // % da largura da card (10-80)
  margem: number; // px da borda (0-40)
  opacidade: number; // 0-100 (mín. 20)
}

export const SELO_POSICOES: { value: SeloPosicao; label: string }[] = [
  { value: "top-left", label: "Superior esquerdo" },
  { value: "top-right", label: "Superior direito" },
  { value: "bottom-left", label: "Inferior esquerdo" },
  { value: "bottom-right", label: "Inferior direito" },
];

export const SELO_CONFIG_PADRAO: SeloConfig = { ativo: true, posicao: "top-left", tamanho: 38, margem: 12, opacidade: 100 };

// Classes Tailwind do canto, conforme a posição.
export function seloPosClasses(p: SeloPosicao): string {
  switch (p) {
    case "top-right": return "right-0 top-0";
    case "bottom-left": return "left-0 bottom-0";
    case "bottom-right": return "right-0 bottom-0";
    default: return "left-0 top-0";
  }
}

// Posições inferiores: nesses casos o selo é empilhado ACIMA do título do card
// (em vez de sobrepor). Helpers para esse modo.
export function isSeloBottom(p: SeloPosicao): boolean {
  return p === "bottom-left" || p === "bottom-right";
}
// Alinhamento horizontal do selo dentro do container do título (flex column).
export function seloAlignSelf(p: SeloPosicao): string {
  return p === "bottom-right" || p === "top-right" ? "self-end" : "self-start";
}
