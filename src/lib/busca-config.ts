import "server-only";
import { db } from "@/lib/db";
import { configuracoes } from "@/db/schema";
import { logger } from "@/lib/logger";

export interface BuscaConfig {
  titulo: string;
  placeholder: string;
  cor: string;            // cor primária (botões, ativos)
  qtdCidades: number;     // chips "cidades populares"
  qtdRecentes: number;    // itens "adicionados recentemente"
  mostrarFiltros: boolean;
  mostrarCidades: boolean;
  mostrarTipos: boolean;
  mostrarRecentes: boolean;
}

export const BUSCA_DEFAULTS: BuscaConfig = {
  titulo: "Buscar Imóveis",
  placeholder: "Buscar empreendimento...",
  cor: "#002A5C",
  qtdCidades: 5,
  qtdRecentes: 6,
  mostrarFiltros: true,
  mostrarCidades: true,
  mostrarTipos: true,
  mostrarRecentes: true,
};

export async function lerBuscaConfig(): Promise<BuscaConfig> {
  let map: Record<string, string> = {};
  try {
    const rows = await db.select().from(configuracoes);
    map = Object.fromEntries(rows.map((r) => [r.chave, r.valor ?? ""]));
  } catch (err) { logger.warn({ err, action: "ler_busca_config" }, "usando busca config padrão"); }

  const num = (k: string, d: number) => {
    const v = parseInt(map[k] ?? "", 10);
    return Number.isFinite(v) && v >= 0 ? v : d;
  };
  const bool = (k: string, d: boolean) => (map[k] == null || map[k] === "" ? d : map[k] === "true");

  return {
    titulo: map["busca_titulo"] || BUSCA_DEFAULTS.titulo,
    placeholder: map["busca_placeholder"] || BUSCA_DEFAULTS.placeholder,
    cor: map["busca_cor"] || BUSCA_DEFAULTS.cor,
    qtdCidades: num("busca_qtd_cidades", BUSCA_DEFAULTS.qtdCidades),
    qtdRecentes: num("busca_qtd_recentes", BUSCA_DEFAULTS.qtdRecentes),
    mostrarFiltros: bool("busca_mostrar_filtros", BUSCA_DEFAULTS.mostrarFiltros),
    mostrarCidades: bool("busca_mostrar_cidades", BUSCA_DEFAULTS.mostrarCidades),
    mostrarTipos: bool("busca_mostrar_tipos", BUSCA_DEFAULTS.mostrarTipos),
    mostrarRecentes: bool("busca_mostrar_recentes", BUSCA_DEFAULTS.mostrarRecentes),
  };
}
