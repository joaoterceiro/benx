import { empreendimentosOrdenacao } from "@/db/queries";
import { HomeCardsForm } from "@/components/admin/home-cards-form";

export default async function HomeCardsPage() {
  const grupos = await empreendimentosOrdenacao();
  return <HomeCardsForm grupos={grupos} />;
}
