import "server-only";
import { db } from "@/lib/db";
import { configuracoes } from "@/db/schema";
import { logger } from "@/lib/logger";

// Configurações globais do site, editáveis no admin (tabela key-value).
export interface SiteConfig {
  whatsappNumero: string; // só dígitos (ex.: 5511999999999)
  whatsappAtivo: boolean;
  whatsappTexto: string;
  whatsappMensagem: string; // template; {empreendimento} é substituído na página de produto
}

const TEXTO_PADRAO = "Online · responde em minutos";
const MENSAGEM_PADRAO = "Olá! Tenho interesse no {empreendimento} e gostaria de mais informações.";

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
  };
}
