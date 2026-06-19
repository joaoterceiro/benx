import { listarMidias } from "@/lib/storage";
import { MidiaBiblioteca } from "@/components/admin/midia-biblioteca";

export const dynamic = "force-dynamic";

export const metadata = { title: "Biblioteca de Mídia" };

export default async function MidiaPage() {
  const itens = await listarMidias();
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[18px] font-semibold">Biblioteca de Mídia</h1>
        <p className="mt-0.5 text-[13px] text-foreground-secondary">
          {itens.length} {itens.length === 1 ? "arquivo" : "arquivos"} no MinIO. Envie novas mídias (imagem, vídeo, áudio, PDF) e copie os links para usar no site.
        </p>
      </div>
      <MidiaBiblioteca itens={itens} />
    </div>
  );
}
