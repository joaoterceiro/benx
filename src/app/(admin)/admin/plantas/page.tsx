import { listarPlantasAdmin } from "@/db/queries";
import { PlantasTable } from "@/components/admin/plantas-table";

export const dynamic = "force-dynamic";

export default async function PlantasPage() {
  const plantas = await listarPlantasAdmin();
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Plantas</h1>
        <p className="text-sm text-foreground-secondary">
          {plantas.length} {plantas.length === 1 ? "tipologia" : "tipologias"}. Crie e vincule plantas dentro de cada empreendimento (aba Plantas); aqui você vê todas e pode excluir.
        </p>
      </div>
      <PlantasTable plantas={plantas} />
    </div>
  );
}
