import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, ExternalLink } from "lucide-react";
import { postPublicadoPorSlug, postsRelacionados } from "@/db/queries";
import { sanitizarHtml } from "@/lib/sanitize";
import { JornalTopo } from "@/components/public/jornal/jornal-topo";
import { SiteFooter } from "@/components/public/site-footer";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await postPublicadoPorSlug(slug);
  if (!post) return { title: { absolute: "Matéria não encontrada — Benx Journal" } };
  const titulo = (post.seoTitulo || post.titulo || "").trim();
  const descricao = (post.seoDescricao || post.resumo || "").trim() || undefined;
  const imagem = post.imagemUrl ?? undefined;
  return {
    title: { absolute: `${titulo} — Benx Journal` },
    description: descricao,
    alternates: { canonical: `/benx-journal/${slug}` },
    openGraph: {
      title: titulo,
      description: descricao,
      type: "article",
      url: `/benx-journal/${slug}`,
      images: imagem ? [{ url: imagem }] : undefined,
    },
    twitter: {
      card: imagem ? "summary_large_image" : "summary",
      title: titulo,
      description: descricao,
      images: imagem ? [imagem] : undefined,
    },
  };
}

const COL = "mx-auto w-full max-w-site px-6";
const NAVY = "#0A2A66";
const VERMELHO = "#b91c1c";

function dataBR(d: Date): string {
  return new Date(d).toLocaleDateString("pt-BR");
}

export default async function MateriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await postPublicadoPorSlug(slug);
  if (!post) notFound();

  const relacionados = await postsRelacionados(post.slug, post.categoria, 3);
  const conteudoBruto = post.conteudo ?? "";
  const ehHtml = /<\/?[a-z][\s\S]*>/i.test(conteudoBruto);
  // Sanitiza o HTML antes de renderizar (defesa contra XSS armazenado).
  const conteudo = ehHtml ? sanitizarHtml(conteudoBruto) : conteudoBruto;
  const paragrafos = conteudo.split(/\n+/).map((p) => p.trim()).filter(Boolean);

  return (
    <main className="min-h-screen bg-white text-[#1a1a1a]">
      <JornalTopo />
      <div className="h-20" />

      {/* hero */}
      <section className={`${COL} pt-4`}>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            {post.imagemUrl ? (
              <Image src={post.imagemUrl} alt={post.titulo} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            ) : <div className="absolute inset-0 bg-black/5" />}
            {post.fonte && (
              <span className="absolute left-0 top-0 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white" style={{ background: VERMELHO }}>
                {post.fonte}
              </span>
            )}
          </div>
          <div className="flex flex-col justify-center">
            {post.fonte && (
              <span className="mb-5 inline-flex w-fit items-center border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ borderColor: NAVY, color: NAVY }}>
                {post.fonte}
              </span>
            )}
            <h1 className="font-serif text-[30px] leading-[1.18] text-[#1a1a1a] sm:text-[40px]">{post.titulo}</h1>
            <div className="mt-8 flex items-center justify-between gap-4 border-t border-black/10 pt-5">
              <div className="flex flex-col gap-1">
                <span className="text-[12px] italic text-black/45">{dataBR(post.dataPublicacao)}</span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: VERMELHO }}>{post.categoria}</span>
              </div>
              {post.fonteUrl && (
                <a href={post.fonteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-white transition hover:brightness-110" style={{ background: NAVY }}>
                  Ler na íntegra <ArrowRight size={15} />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* faixa de resumo */}
      {post.resumo && (
        <div className="mt-10" style={{ background: NAVY }}>
          <div className={`${COL} py-5`}>
            <p className="border-l-2 pl-4 text-[15px] leading-relaxed text-white/90" style={{ borderColor: VERMELHO }}>{post.resumo}</p>
          </div>
        </div>
      )}

      {/* corpo + sidebar */}
      <section className={`${COL} py-14`}>
        <div className="grid gap-12 lg:grid-cols-[1fr_300px]">
          <div className="max-w-2xl">
            {ehHtml ? (
              <div className="jornal-conteudo text-[15px] leading-[1.8] text-black/75" dangerouslySetInnerHTML={{ __html: conteudo }} />
            ) : (
              <div className="flex flex-col gap-5 text-[15px] leading-[1.8] text-black/75">
                {paragrafos.length > 0 ? paragrafos.map((p, i) => <p key={i}>{p}</p>) : <p className="text-black/40">Sem conteúdo.</p>}
              </div>
            )}
            {post.fonteUrl && (
              <a href={post.fonteUrl} target="_blank" rel="noopener noreferrer" className="mt-10 inline-flex items-center gap-2 border px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.12em] transition hover:bg-black/[0.03]" style={{ borderColor: NAVY, color: NAVY }}>
                Leia o artigo na íntegra <ExternalLink size={14} />
              </a>
            )}
          </div>

          {/* sidebar */}
          <aside className="flex flex-col gap-8 border-l border-black/10 pl-8">
            {post.fonte && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-black/40">Fonte</p>
                <p className="mt-2 font-serif text-[20px] text-[#1a1a1a]">{post.fonte}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-black/45">Veículo onde a matéria foi originalmente publicada.</p>
              </div>
            )}
            {relacionados.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-black/40">Leia também</p>
                <ul className="mt-3 flex flex-col gap-5">
                  {relacionados.map((r) => (
                    <li key={r.id}>
                      <Link href={`/benx-journal/${r.slug}`} className="group block">
                        {r.fonte && <span className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: VERMELHO }}>{r.fonte}</span>}
                        <p className="mt-1 text-[14px] leading-snug text-black/80 transition group-hover:text-[#0A4DCC]">{r.titulo}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* leia também (cards) */}
      {relacionados.length > 0 && (
        <section className="bg-[#ececec]">
          <div className={`${COL} py-16`}>
            <h2 className="font-serif text-[26px]" style={{ color: NAVY }}>Leia também</h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {relacionados.map((r) => (
                <article key={r.id} className="flex gap-4">
                  <Link href={`/benx-journal/${r.slug}`} className="shrink-0 overflow-hidden">
                    {r.imagemUrl ? (
                      <div className="relative h-28 w-28 overflow-hidden">
                        <Image src={r.imagemUrl} alt={r.titulo} fill sizes="112px" loading="lazy" className="object-cover" />
                      </div>
                    ) : <div className="h-28 w-28 bg-black/10" />}
                  </Link>
                  <div className="min-w-0">
                    {r.fonte && <p className="text-[11px] text-black/45">{r.fonte}</p>}
                    <Link href={`/benx-journal/${r.slug}`}>
                      <h3 className="mt-1 font-serif text-[15px] leading-snug text-[#1a1a1a] transition hover:text-[#0A4DCC]">{r.titulo}</h3>
                    </Link>
                    {r.resumo && <p className="mt-1.5 line-clamp-3 text-[12px] leading-relaxed text-black/55">{r.resumo}</p>}
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link href="/benx-journal" className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em]" style={{ color: NAVY }}>
                Ver todas as notícias <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </main>
  );
}
