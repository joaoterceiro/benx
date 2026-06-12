import { empreendimentosOrdenacao, lerModosHome } from "@/db/queries";
import { HomeCardsForm } from "@/components/admin/home-cards-form";

export default async function HomeCardsPage() {
  const [grupos, modos] = await Promise.all([empreendimentosOrdenacao(), lerModosHome()]);
  return <HomeCardsForm grupos={grupos} modos={modos} />;
}
