import { lerConfiguracoes } from "@/lib/config";
import { ConfiguracoesForm } from "@/components/admin/configuracoes-form";

export default async function WhatsAppConfigPage() {
  const cfg = await lerConfiguracoes();
  return <ConfiguracoesForm inicial={cfg} />;
}
