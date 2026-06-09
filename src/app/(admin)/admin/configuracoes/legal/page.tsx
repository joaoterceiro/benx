import { lerLegal } from "@/lib/legal";
import { LegalConfigForm } from "@/components/admin/legal-config-form";

export const dynamic = "force-dynamic";

export default async function LegalConfigPage() {
  const cfg = await lerLegal();
  return (
    <LegalConfigForm
      inicial={{ politica: cfg.politica, termos: cfg.termos, cookiesTexto: cfg.cookiesTexto }}
    />
  );
}
