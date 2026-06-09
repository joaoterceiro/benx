// Versão dos documentos legais / consentimento. Ao alterar a política, suba a
// versão: o banner de cookies reaparece e novos consentimentos são registrados
// com esta marca (re-consentimento). Seguro para client e server.
export const POLITICA_VERSAO = "2026-06-06";

export type CategoriasConsentimento = {
  necessarios: true; // sempre ativos (não bloqueáveis)
  analiticos: boolean;
  marketing: boolean;
};

export type AcaoConsentimento = "aceitar_todos" | "recusar" | "personalizado";
