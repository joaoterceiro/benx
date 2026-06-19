import "server-only";
import { db } from "@/lib/db";
import { configuracoes } from "@/db/schema";
import { logger } from "@/lib/logger";
import { SELO_CONFIG_PADRAO, type SeloConfig, type SeloPosicao } from "@/lib/selo";
import { INFO_DEFAULTS, INFO_CHAVES, type ChaveInfo, type VarianteInfo } from "@/lib/info-habitacao";

// Configurações globais do site, editáveis no admin (tabela key-value).
export interface SiteConfig {
  whatsappNumero: string; // só dígitos (ex.: 5511999999999)
  whatsappAtivo: boolean; // liga/desliga o botão de Atendimento (launcher)
  whatsappTexto: string;
  whatsappMensagem: string; // template; {empreendimento} é substituído na página de produto
  // Demais canais do launcher de Atendimento
  atendStatus: string; // ex.: "Online · Equipe disponível agora"
  atendTelefone: string; // central de vendas, ex.: "0800 729 1981" (vazio = oculta)
  atendEmail: string; // ex.: "vendas@benx.com.br" (vazio = oculta)
  atendCanal: string; // canal de atendimento, ex.: "4003-8503" (vazio = oculta)
  atendCanalHorario: string; // ex.: "Seg - Sex · 9:00 às 17:00"
}

const TEXTO_PADRAO = "Online · responde em minutos";
const MENSAGEM_PADRAO = "Olá! Tenho interesse no {empreendimento} e gostaria de mais informações.";
const ATEND_STATUS_PADRAO = "Online · Equipe disponível agora";
const ATEND_TEL_PADRAO = "0800 729 1981";
const ATEND_EMAIL_PADRAO = "vendas@benx.com.br";
const ATEND_CANAL_PADRAO = "4003-8503";
const ATEND_HORARIO_PADRAO = "Seg - Sex · 9:00 às 17:00";

export async function lerConfiguracoes(): Promise<SiteConfig> {
  let map: Record<string, string> = {};
  try {
    const rows = await db.select().from(configuracoes);
    map = Object.fromEntries(rows.map((r) => [r.chave, r.valor ?? ""]));
  } catch (err) {
    logger.warn({ err, action: "ler_configuracoes" }, "usando configurações padrão (tabela ausente ou erro de banco)");
  }
  return {
    whatsappNumero: map["whatsapp_numero"] ?? "",
    whatsappAtivo: (map["whatsapp_ativo"] ?? "false") === "true",
    whatsappTexto: map["whatsapp_texto"] || TEXTO_PADRAO,
    whatsappMensagem: map["whatsapp_mensagem"] ?? MENSAGEM_PADRAO,
    atendStatus: map["atend_status"] || ATEND_STATUS_PADRAO,
    atendTelefone: map["atend_telefone"] ?? ATEND_TEL_PADRAO,
    atendEmail: map["atend_email"] ?? ATEND_EMAIL_PADRAO,
    atendCanal: map["atend_canal"] ?? ATEND_CANAL_PADRAO,
    atendCanalHorario: map["atend_canal_horario"] ?? ATEND_HORARIO_PADRAO,
  };
}

// Config global do selo de habitação nas cards (posição/tamanho/margem/opacidade).
export async function lerSeloConfig(): Promise<SeloConfig> {
  let map: Record<string, string> = {};
  try {
    const rows = await db.select().from(configuracoes);
    map = Object.fromEntries(rows.map((r) => [r.chave, r.valor ?? ""]));
  } catch (err) {
    logger.warn({ err, action: "ler_selo_config" }, "usando config de selo padrão");
  }
  const posicoes: SeloPosicao[] = ["top-left", "top-right", "bottom-left", "bottom-right"];
  const num = (v: string | undefined, d: number, min: number, max: number) => {
    const n = Math.round(Number(v));
    return Number.isFinite(n) && v !== "" && v != null ? Math.min(max, Math.max(min, n)) : d;
  };
  return {
    ativo: map["selo_ativo"] !== "false", // ligado por padrão; só desliga com "false" explícito
    posicao: posicoes.includes(map["selo_posicao"] as SeloPosicao) ? (map["selo_posicao"] as SeloPosicao) : SELO_CONFIG_PADRAO.posicao,
    tamanho: num(map["selo_tamanho"], SELO_CONFIG_PADRAO.tamanho, 10, 80),
    margem: num(map["selo_margem"], SELO_CONFIG_PADRAO.margem, 0, 40),
    opacidade: num(map["selo_opacidade"], SELO_CONFIG_PADRAO.opacidade, 20, 100),
  };
}

function parseVariante(raw?: string): VarianteInfo | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as { titulo?: unknown; secoes?: unknown };
    if (typeof o?.titulo !== "string" || !Array.isArray(o.secoes)) return null;
    const secoes = (o.secoes as unknown[])
      .filter((s): s is { q: string; html: string } => !!s && typeof (s as { q?: unknown }).q === "string" && typeof (s as { html?: unknown }).html === "string")
      .map((s) => ({ q: s.q, html: s.html }));
    return { titulo: o.titulo, secoes };
  } catch {
    return null;
  }
}

// Conteúdo "Informações importantes" (HIS/HMP) editável no admin; fallback nos defaults.
export async function lerInfoHabitacao(): Promise<Record<ChaveInfo, VarianteInfo>> {
  let map: Record<string, string> = {};
  try {
    const rows = await db.select().from(configuracoes);
    map = Object.fromEntries(rows.map((r) => [r.chave, r.valor ?? ""]));
  } catch (err) {
    logger.warn({ err, action: "ler_info_habitacao" }, "usando info de habitação padrão");
  }
  const out = {} as Record<ChaveInfo, VarianteInfo>;
  (Object.keys(INFO_CHAVES) as ChaveInfo[]).forEach((k) => {
    out[k] = parseVariante(map[INFO_CHAVES[k]]) ?? INFO_DEFAULTS[k];
  });
  return out;
}
