import { listarBibliotecaMidias } from "@/db/queries";
import { MidiasLibrary } from "@/components/admin/midias-library";

export const dynamic = "force-dynamic";

export default async function MidiasPage() {
  const midias = await listarBibliotecaMidias(200);
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mídias</h1>
        <p className="text-sm text-foreground-secondary">
          {midias.length} {midias.length === 1 ? "mídia" : "mídias"} no MinIO. Filtre, busque e exclua. O envio é feito pelas galerias de cada empreendimento.
        </p>
      </div>
      <MidiasLibrary midias={midias} />
    </div>
  );
}
