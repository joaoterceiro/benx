import { db } from "@/lib/db";
import { configuracoes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { listarVertentes } from "@/lib/ecossistema";

// Config da faixa de empreendimentos por home (vertente). Guardada como JSON em
// configuracoes na chave home_strip_<value>.
export type ModoStrip = "fixados_aleatorio" | "fixados_tags_aleatorio" | "fixados_tags_recentes" | "so_tags";
export interface StripCols { mobile: number; tablet: number; desktop: number; wide: number }
export interface StripConfig { cols: StripCols; modo: ModoStrip; tags: string[] }

// Tags (status de obra) na ordem padrão.
export const STATUS_TAGS = ["lancamento", "em_construcao", "pronto_para_morar", "entregue"] as const;
const MODOS: ModoStrip[] = ["fixados_aleatorio", "fixados_tags_aleatorio", "fixados_tags_recentes", "so_tags"];

export const STRIP_DEFAULT: StripConfig = {
  cols: { mobile: 2, tablet: 3, desktop: 4, wide: 5 },
  modo: "fixados_aleatorio",
  tags: [...STATUS_TAGS],
};

export function chaveStrip(value: string): string {
  return `home_strip_${value}`;
}

function clamp(n: unknown, d: number): number {
  const x = Math.trunc(Number(n));
  return Number.isFinite(x) && x >= 1 && x <= 6 ? x : d;
}

export function parseStripConfig(raw: string | null | undefined): StripConfig {
  if (!raw) return STRIP_DEFAULT;
  try {
    const o = JSON.parse(raw) as { cols?: Partial<StripCols>; modo?: string; tags?: unknown[] };
    const cols: StripCols = {
      mobile: clamp(o?.cols?.mobile, STRIP_DEFAULT.cols.mobile),
      tablet: clamp(o?.cols?.tablet, STRIP_DEFAULT.cols.tablet),
      desktop: clamp(o?.cols?.desktop, STRIP_DEFAULT.cols.desktop),
      wide: clamp(o?.cols?.wide, STRIP_DEFAULT.cols.wide),
    };
    const modo = (MODOS as string[]).includes(o?.modo ?? "") ? (o.modo as ModoStrip) : STRIP_DEFAULT.modo;
    const tagsSalvas = Array.isArray(o?.tags) ? (o.tags as unknown[]).filter((t): t is string => typeof t === "string" && (STATUS_TAGS as readonly string[]).includes(t)) : [];
    // garante as 4 tags: faltantes entram no fim na ordem padrão.
    const tags = [...tagsSalvas, ...STATUS_TAGS.filter((t) => !tagsSalvas.includes(t))];
    return { cols, modo, tags };
  } catch {
    return STRIP_DEFAULT;
  }
}

export async function lerStripConfig(value: string): Promise<StripConfig> {
  const [row] = await db
    .select({ valor: configuracoes.valor })
    .from(configuracoes)
    .where(eq(configuracoes.chave, chaveStrip(value)))
    .limit(1);
  return parseStripConfig(row?.valor);
}

export async function lerTodosStripConfig(): Promise<Record<string, StripConfig>> {
  const out: Record<string, StripConfig> = {};
  await Promise.all(listarVertentes().map(async (v) => { out[v.value] = await lerStripConfig(v.value); }));
  return out;
}
