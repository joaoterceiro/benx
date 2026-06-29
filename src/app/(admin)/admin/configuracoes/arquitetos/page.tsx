import { lerArquitetos, resolverImagemArquiteto } from "@/lib/mentes";
import { ArquitetosForm } from "@/components/admin/arquitetos-form";

export default async function ArquitetosConfigPage() {
  const inicial = await lerArquitetos();
  const previews = await Promise.all(inicial.map((a) => resolverImagemArquiteto(a.imagem)));
  return <ArquitetosForm inicial={inicial} previews={previews} />;
}
