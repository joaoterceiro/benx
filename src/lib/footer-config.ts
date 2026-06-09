import "server-only";
import { db } from "@/lib/db";
import { configuracoes } from "@/db/schema";
import { getUrl } from "@/lib/storage";
import { logger } from "@/lib/logger";

// Resolve chave do MinIO em URL; paths (/...) e URLs (http) passam direto.
export async function resolverFooterMidia(v: string): Promise<string> {
  if (!v) return "";
  return v.startsWith("/") || /^https?:\/\//.test(v) ? v : getUrl(v);
}

export interface FooterLink { label: string; href: string }
export interface FooterConfig {
  logo: string;
  bgUrl: string;
  frase: string;
  sobreUrl: string;
  endereco: string;        // multilinha
  telefone: string;
  telefoneLink: string;
  redes: { facebook: string; x: string; youtube: string; instagram: string; pinterest: string };
  paginas: FooterLink[];
  institucional: FooterLink[];
  copyright: string;
  designBy: string;
}

export const FOOTER_DEFAULTS: FooterConfig = {
  logo: "/logo-benx-branco.png",
  bgUrl: "/footer-bg.jpg",
  frase: "Transformar cidades e\nmudar a vida das pessoas",
  sobreUrl: "/origem-proposito",
  endereco: "Av. Dr. Cardoso De Melo, 1340 - 6º Andar\nVila Olímpia • São Paulo • SP  CEP: 04548-004",
  telefone: "0800 729 1981",
  telefoneLink: "tel:08007291981",
  redes: {
    facebook: "https://www.facebook.com/benxincorporadora",
    x: "https://twitter.com/BenxIncorp",
    youtube: "https://www.youtube.com/BenxIncorporadora",
    instagram: "https://www.instagram.com/benx.oficial/",
    pinterest: "https://br.pinterest.com/benxincorporadora",
  },
  paginas: [
    { label: "VIVABENX", href: "/vivabenx" },
    { label: "PORTAL DO CLIENTE", href: "/portal-do-cliente" },
    { label: "CORRETORES E IMOBILIÁRIAS", href: "/corretores-e-imobiliarias" },
    { label: "TRABALHE CONOSCO", href: "/trabalhe-conosco" },
    { label: "VENDA SEU TERRENO", href: "/venda-seu-terreno" },
    { label: "SOU VIZINHO", href: "/sou-vizinho" },
  ],
  institucional: [
    { label: "ESG", href: "/esg" },
    { label: "POLÍTICA DE PRIVACIDADE", href: "/politica-de-privacidade" },
    { label: "ASSESSORIA DE IMPRENSA", href: "/assessoria-de-imprensa" },
    { label: "CANAL DE ÉTICA", href: "/canal-de-etica" },
  ],
  copyright: "© 2012 - 2025 Benx. Direitos Reservados.",
  designBy: "Olive / Imagenou",
};

function parseLinks(raw: string | undefined, fallback: FooterLink[]): FooterLink[] {
  if (!raw) return fallback;
  try {
    const p = JSON.parse(raw);
    if (Array.isArray(p)) {
      const lista = p
        .map((x) => ({ label: String(x?.label ?? "").trim(), href: String(x?.href ?? "").trim() || "#" }))
        .filter((x) => x.label);
      return lista.length ? lista : fallback;
    }
  } catch (err) { logger.warn({ err, action: "parse_footer_links" }, "JSON de links do footer inválido"); }
  return fallback;
}

export async function lerFooterConfig(): Promise<FooterConfig> {
  let map: Record<string, string> = {};
  try {
    const rows = await db.select().from(configuracoes);
    map = Object.fromEntries(rows.map((r) => [r.chave, r.valor ?? ""]));
  } catch (err) { logger.warn({ err, action: "ler_footer_config" }, "usando footer config padrão"); }

  const d = FOOTER_DEFAULTS;
  return {
    logo: map["footer_logo"] || d.logo,
    bgUrl: map["footer_bg"] || d.bgUrl,
    frase: map["footer_frase"] ?? d.frase,
    sobreUrl: map["footer_sobre_url"] || d.sobreUrl,
    endereco: map["footer_endereco"] ?? d.endereco,
    telefone: map["footer_telefone"] ?? d.telefone,
    telefoneLink: map["footer_telefone_link"] || d.telefoneLink,
    redes: {
      facebook: map["footer_rede_facebook"] ?? d.redes.facebook,
      x: map["footer_rede_x"] ?? d.redes.x,
      youtube: map["footer_rede_youtube"] ?? d.redes.youtube,
      instagram: map["footer_rede_instagram"] ?? d.redes.instagram,
      pinterest: map["footer_rede_pinterest"] ?? d.redes.pinterest,
    },
    paginas: parseLinks(map["footer_paginas"], d.paginas),
    institucional: parseLinks(map["footer_institucional"], d.institucional),
    copyright: map["footer_copyright"] ?? d.copyright,
    designBy: map["footer_designby"] ?? d.designBy,
  };
}
