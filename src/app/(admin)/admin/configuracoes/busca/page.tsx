import { lerBuscaConfig } from "@/lib/busca-config";
import { BuscaConfigForm } from "@/components/admin/busca-config-form";

export default async function BuscaConfigPage() {
  const cfg = await lerBuscaConfig();
  return <BuscaConfigForm inicial={cfg} />;
}
