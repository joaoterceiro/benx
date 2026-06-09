import "server-only";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { menuItens, configuracoes } from "@/db/schema";
import { logger } from "@/lib/logger";

export interface MenuItemRow {
  id: string;
  texto: string;
  url: string;
  ordem: number;
  parentId: string | null;
  ativo: boolean;
}
export interface MenuItem extends MenuItemRow {
  filhos: MenuItem[];
}

export interface MenuConfig {
  footerLogo: string;
  footerTitulo: string;
  footerContato: string;
  rootSize: number;
  rootWeight: number;
  subSize: number;
  subWeight: number;
}

const DEFAULTS: MenuConfig = {
  footerLogo: "/logo-benx-branco.png",
  footerTitulo: "BENX",
  footerContato: "Av. Dr. Cardoso De Melo, 1340 - 6º Andar\nVila Olímpia • São Paulo • SP\nCEP: 04548-004 | 0800 729 1981",
  rootSize: 16,
  rootWeight: 500,
  subSize: 14,
  subWeight: 400,
};

// Lista crua (todos os itens) ordenada — usada pelo admin.
export async function listarMenuFlat(): Promise<MenuItemRow[]> {
  const rows = await db.select().from(menuItens).orderBy(asc(menuItens.ordem));
  return rows.map((r) => ({
    id: r.id, texto: r.texto, url: r.url, ordem: r.ordem, parentId: r.parentId, ativo: r.ativo,
  }));
}

function montarHierarquia(flat: MenuItemRow[]): MenuItem[] {
  const porPai = new Map<string | null, MenuItem[]>();
  for (const r of flat) {
    const item: MenuItem = { ...r, filhos: [] };
    const key = r.parentId ?? null;
    const arr = porPai.get(key) ?? [];
    arr.push(item);
    porPai.set(key, arr);
  }
  // anexa filhos
  for (const arr of porPai.values()) {
    for (const it of arr) it.filhos = porPai.get(it.id) ?? [];
  }
  return porPai.get(null) ?? [];
}

export async function lerMenuConfig(): Promise<MenuConfig> {
  let map: Record<string, string> = {};
  try {
    const rows = await db.select().from(configuracoes);
    map = Object.fromEntries(rows.map((r) => [r.chave, r.valor ?? ""]));
  } catch (err) { logger.warn({ err, action: "ler_menu_config" }, "usando menu config padrão"); }
  const num = (k: string, d: number) => {
    const v = parseInt(map[k] ?? "", 10);
    return Number.isFinite(v) ? v : d;
  };
  return {
    footerLogo: map["menu_footer_logo"] || DEFAULTS.footerLogo,
    footerTitulo: map["menu_footer_title"] || DEFAULTS.footerTitulo,
    footerContato: map["menu_footer_contact"] || DEFAULTS.footerContato,
    rootSize: num("menu_root_size", DEFAULTS.rootSize),
    rootWeight: num("menu_root_weight", DEFAULTS.rootWeight),
    subSize: num("menu_sub_size", DEFAULTS.subSize),
    subWeight: num("menu_sub_weight", DEFAULTS.subWeight),
  };
}

// Menu público: hierarquia só com itens ativos + config.
export async function lerMenuPublico(): Promise<{ itens: MenuItem[]; config: MenuConfig }> {
  let flat: MenuItemRow[] = [];
  try {
    flat = (await listarMenuFlat()).filter((i) => i.ativo);
  } catch (err) { logger.warn({ err, action: "ler_menu_publico" }, "menu indisponível, retornando vazio"); }
  const config = await lerMenuConfig();
  return { itens: montarHierarquia(flat), config };
}
