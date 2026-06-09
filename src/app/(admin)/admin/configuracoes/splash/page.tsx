import { lerSplashConfig, resolverSplashMidia } from "@/lib/splash";
import { SplashConfigForm } from "@/components/admin/splash-config-form";

export default async function SplashConfigPage() {
  const cfg = await lerSplashConfig();
  const [video, benx, viva, extra] = await Promise.all([
    resolverSplashMidia(cfg.videoUrl),
    resolverSplashMidia(cfg.logoBenx),
    resolverSplashMidia(cfg.logoViva),
    resolverSplashMidia(cfg.logoExtra),
  ]);
  return <SplashConfigForm inicial={cfg} previews={{ video, benx, viva, extra }} />;
}
