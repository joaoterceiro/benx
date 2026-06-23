import { empreendimentosOrdenacao } from "@/db/queries";
import { lerTodosStripConfig, lerTodosPromoIds } from "@/lib/strip-config";
import { HomeCardsForm } from "@/components/admin/home-cards-form";

export default async function HomeCardsPage() {
  const [grupos, configs, promos] = await Promise.all([
    empreendimentosOrdenacao(),
    lerTodosStripConfig(),
    lerTodosPromoIds(),
  ]);
  return <HomeCardsForm grupos={grupos} configs={configs} promos={promos} />;
}
