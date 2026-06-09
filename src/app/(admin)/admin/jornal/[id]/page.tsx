import { notFound } from "next/navigation";
import { postPorId, categoriasJornal } from "@/db/queries";
import { getUrl } from "@/lib/storage";
import { JornalForm } from "@/components/admin/jornal-form";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";

export const dynamic = "force-dynamic";

export default async function EditarPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, categorias] = await Promise.all([postPorId(id), categoriasJornal()]);
  if (!post) notFound();

  const preview = post.imagem
    ? (post.imagem.startsWith("/") || /^https?:\/\//.test(post.imagem) ? post.imagem : await getUrl(post.imagem))
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Breadcrumbs itens={[{ label: "Benx Jornal", href: "/admin/jornal" }, { label: post.titulo || "Editar post" }]} />
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Editar post</h1>
      </div>
      <JornalForm
        categorias={categorias}
        imagemPreview={preview}
        inicial={{
          id: post.id,
          titulo: post.titulo,
          slug: post.slug,
          categoria: post.categoria,
          fonte: post.fonte ?? "",
          fonteUrl: post.fonteUrl ?? "",
          resumo: post.resumo ?? "",
          conteudo: post.conteudo ?? "",
          imagem: post.imagem ?? "",
          seoTitulo: post.seoTitulo ?? "",
          seoDescricao: post.seoDescricao ?? "",
          dataPublicacao: post.dataPublicacao.toISOString(),
          destaque: post.destaque,
          publicado: post.publicado,
        }}
      />
    </div>
  );
}
