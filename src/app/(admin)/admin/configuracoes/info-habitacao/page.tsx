import { lerInfoHabitacao } from "@/lib/config";
import { InfoHabitacaoForm } from "@/components/admin/info-habitacao-form";

export default async function InfoHabitacaoPage() {
  const inicial = await lerInfoHabitacao();
  return <InfoHabitacaoForm inicial={inicial} />;
}
