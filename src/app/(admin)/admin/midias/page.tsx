import { listarMidias } from "@/lib/storage";
import { MidiaBiblioteca } from "@/components/admin/midia-biblioteca";

export const dynamic = "force-dynamic";

export const metadata = { title: "Mídias" };

export default async function MidiasPage() {
  const itens = await listarMidias();
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mídias</h1>
        <p className="text-sm text-foreground-secondary">
          {itens.length} {itens.length === 1 ? "arquivo" : "arquivos"} no MinIO. Envie novas mídias (imagem, vídeo, áudio, PDF), busque e copie os links para usar no site.
        </p>
      </div>
      <MidiaBiblioteca itens={itens} />
    </div>
  );
}
