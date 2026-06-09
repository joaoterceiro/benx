import { listarSlidesAdmin, empreendimentosParaSlide } from "@/db/queries";
import { listarVertentes } from "@/lib/ecossistema";
import { SliderManager } from "@/components/admin/slider-manager";

export const dynamic = "force-dynamic";

export default async function SliderConfigPage() {
  const [slides, empreendimentos] = await Promise.all([listarSlidesAdmin(), empreendimentosParaSlide()]);
  const locais = listarVertentes().map((v) => ({ value: v.value, label: v.label }));
  return <SliderManager slides={slides} locais={locais} empreendimentos={empreendimentos} />;
}
