import "server-only";
import { db } from "@/lib/db";
import { configuracoes } from "@/db/schema";
import { getUrl } from "@/lib/storage";
import { logger } from "@/lib/logger";

export type SplashLogoKey = "benx" | "viva" | "extra";

export interface SplashBotao {
  label: string;
  logoKey: SplashLogoKey;
  href: string;
  showLabel: boolean;
  subtitle: string;
  logoSize: number; // altura em px (10..400)
}

export interface SplashConfig {
  videoUrl: string;
  logoBenx: string;
  logoViva: string;
  logoExtra: string;
  usarComoHome: boolean;
  botoes: SplashBotao[];
}

export const SPLASH_DEFAULTS: SplashConfig = {
  videoUrl: "/bg-hero.mp4",
  logoBenx: "/splash-benx.png",
  logoViva: "/logo-vivabenx.svg",
  logoExtra: "/parque-global-logo.svg",
  usarComoHome: true,
  botoes: [
    { label: "Icônicos", logoKey: "benx", href: "/iconicos", showLabel: true, subtitle: "Residenciais elevados\nao estado de arte", logoSize: 40 },
    { label: "Benx", logoKey: "benx", href: "/benx", showLabel: false, subtitle: "Projetos de excelência em localizações privilegiadas", logoSize: 40 },
    { label: "Viva Benx", logoKey: "viva", href: "/vivabenx", showLabel: false, subtitle: "A união entre mobilidade urbana e arquitetura inteligente", logoSize: 80 },
    { label: "Parque Global", logoKey: "extra", href: "https://parqueglobal.com.br/", showLabel: false, subtitle: "Novo jeito de viver em São Paulo.", logoSize: 60 },
  ],
};

function normalizarBotao(b: Partial<SplashBotao>): SplashBotao {
  let size = Number(b.logoSize ?? 40);
  if (!Number.isFinite(size)) size = 40;
  size = Math.min(400, Math.max(10, Math.round(size)));
  const logoKey: SplashLogoKey = b.logoKey === "viva" || b.logoKey === "extra" ? b.logoKey : "benx";
  return {
    label: (b.label ?? "").toString(),
    logoKey,
    href: (b.href ?? "#").toString(),
    showLabel: !!b.showLabel,
    subtitle: (b.subtitle ?? "").toString(),
    logoSize: size,
  };
}

export async function lerSplashConfig(): Promise<SplashConfig> {
  let map: Record<string, string> = {};
  try {
    const rows = await db.select().from(configuracoes);
    map = Object.fromEntries(rows.map((r) => [r.chave, r.valor ?? ""]));
  } catch (err) { logger.warn({ err, action: "ler_splash_config" }, "usando splash config padrão"); }

  let botoes = SPLASH_DEFAULTS.botoes;
  if (map["splash_botoes"]) {
    try {
      const parsed = JSON.parse(map["splash_botoes"]);
      if (Array.isArray(parsed)) botoes = parsed.map(normalizarBotao);
    } catch (err) { logger.warn({ err, action: "parse_splash_botoes" }, "JSON de botões inválido, usando defaults"); }
  }

  return {
    videoUrl: map["splash_video"] || SPLASH_DEFAULTS.videoUrl,
    logoBenx: map["splash_logo_benx"] || SPLASH_DEFAULTS.logoBenx,
    logoViva: map["splash_logo_viva"] ?? SPLASH_DEFAULTS.logoViva,
    logoExtra: map["splash_logo_extra"] ?? SPLASH_DEFAULTS.logoExtra,
    usarComoHome: map["splash_home"] === "true",
    botoes,
  };
}

// Resolve a URL do logo de um botão conforme sua chave.
export function logoDoBotao(cfg: SplashConfig, key: SplashLogoKey): string {
  if (key === "viva") return cfg.logoViva;
  if (key === "extra") return cfg.logoExtra;
  return cfg.logoBenx;
}

// Um valor de mídia pode ser: chave do MinIO (upload), path local (/...) ou URL
// externa (http...). Só as chaves do MinIO precisam de URL assinada.
function ehChaveMinio(v: string): boolean {
  return !!v && !v.startsWith("/") && !/^https?:\/\//i.test(v) && !v.startsWith("data:");
}

export async function resolverSplashMidia(v: string): Promise<string> {
  if (!v) return "";
  return ehChaveMinio(v) ? getUrl(v) : v;
}

// Versão com as mídias resolvidas em URL, para renderizar a splash pública.
export async function lerSplashConfigResolvida(): Promise<SplashConfig> {
  const cfg = await lerSplashConfig();
  const [videoUrl, logoBenx, logoViva, logoExtra] = await Promise.all([
    resolverSplashMidia(cfg.videoUrl),
    resolverSplashMidia(cfg.logoBenx),
    resolverSplashMidia(cfg.logoViva),
    resolverSplashMidia(cfg.logoExtra),
  ]);
  return { ...cfg, videoUrl, logoBenx, logoViva, logoExtra };
}
