// Rótulos legíveis para os valores base. status_obra e tipo_habitacao são texto
// livre: valores cadastrados pelo admin não estão neste mapa e são humanizados.
export const STATUS_OBRA_LABEL: Record<string, string> = {
  lancamento: "Lançamento",
  em_construcao: "Em construção",
  pronto_para_morar: "Pronto para morar",
  entregue: "Entregue",
};

export const TIPO_HABITACAO_LABEL: Record<string, string> = {
  his: "HIS",
  hmp: "HMP",
  his_e_hmp: "HIS e HMP",
};

// Converte um token livre (ex.: "pre_lancamento") em rótulo legível ("Pré
// lançamento"). Usado como fallback para valores customizados.
export function humanizar(token: string): string {
  const limpo = token.replace(/[_-]+/g, " ").trim();
  if (!limpo) return "";
  return limpo.charAt(0).toUpperCase() + limpo.slice(1);
}

export function statusObraLabel(v?: string | null): string {
  if (!v) return "";
  return STATUS_OBRA_LABEL[v] ?? humanizar(v);
}

export function tipoHabitacaoLabel(v?: string | null): string {
  if (!v) return "";
  return TIPO_HABITACAO_LABEL[v] ?? humanizar(v);
}
