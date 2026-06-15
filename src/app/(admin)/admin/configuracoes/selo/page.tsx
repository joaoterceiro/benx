import { lerSeloConfig } from "@/lib/config";
import { SeloConfigForm } from "@/components/admin/selo-config-form";

export default async function SeloConfigPage() {
  const cfg = await lerSeloConfig();
  return <SeloConfigForm inicial={cfg} />;
}
