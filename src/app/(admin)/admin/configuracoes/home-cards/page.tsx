import { empreendimentosOrdenacao } from "@/db/queries";
import { lerTodosStripConfig } from "@/lib/strip-config";
import { HomeCardsForm } from "@/components/admin/home-cards-form";

export default async function HomeCardsPage() {
  const [grupos, configs] = await Promise.all([empreendimentosOrdenacao(), lerTodosStripConfig()]);
  return <HomeCardsForm grupos={grupos} configs={configs} />;
}
