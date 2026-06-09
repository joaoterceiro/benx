import Link from "next/link";
import { Plus } from "lucide-react";
import { listarPostsAdmin } from "@/db/queries";
import { JornalTable } from "@/components/admin/jornal-table";

export const dynamic = "force-dynamic";

export default async function JornalListaPage() {
  const posts = await listarPostsAdmin();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Benx Jornal</h1>
          <p className="text-sm text-foreground-secondary">Posts e notícias do blog.</p>
        </div>
        <Link href="/admin/jornal/novo" className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-[13px] font-semibold text-white transition hover:brightness-110">
          <Plus size={16} /> Novo post
        </Link>
      </div>
      <JornalTable posts={posts.map((p) => ({
        id: p.id, titulo: p.titulo, categoria: p.categoria, fonte: p.fonte,
        publicado: p.publicado, destaque: p.destaque,
        dataPublicacao: p.dataPublicacao.toISOString(),
      }))} />
    </div>
  );
}
