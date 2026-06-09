import { lerFooterConfig, resolverFooterMidia } from "@/lib/footer-config";
import { FooterConfigForm } from "@/components/admin/footer-config-form";

export const dynamic = "force-dynamic";

export default async function FooterConfigPage() {
  const cfg = await lerFooterConfig();
  const [logo, bg] = await Promise.all([resolverFooterMidia(cfg.logo), resolverFooterMidia(cfg.bgUrl)]);
  return <FooterConfigForm inicial={cfg} previews={{ logo, bg }} />;
}
