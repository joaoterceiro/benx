import "server-only";
import { db } from "@/lib/db";
import { configuracoes } from "@/db/schema";
import { logger } from "@/lib/logger";

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
