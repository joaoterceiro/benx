import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { listarPostsPublicos, categoriasJornal, type PostResolvido } from "@/db/queries";
import { JornalTopo } from "@/components/public/jornal/jornal-topo";
import { SiteFooter } from "@/components/public/site-footer";

export const dynamic = "force-dynamic";

const COL = "mx-auto w-full max-w-site px-6";
const NAVY = "#0A2A66";

function dataBR(d: Date): string {
  return new Date(d).toLocaleDateString("pt-BR");
}

export default async function BenxJournalPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const [posts, categorias] = await Promise.all([listarPostsPublicos(cat), categoriasJornal()]);

  const destaque = posts[0] ?? null;
  const resto = posts.slice(1);

  return (
    <main className="min-h-screen bg-white text-[#1a1a1a]">
      <JornalTopo />

      {/* espaço para a barra de topo */}
      <div className="h-20" />

      <div className={`${COL} pb-16 pt-6`}>
        <p className="text-[12px] font-semibold uppercase tracking-[0.25em] text-[#1a1a1a]">Benx Journal</p>

        {/* abas de categoria */}
        <nav className="mt-5 flex flex-wrap gap-7 border-b border-black/10 pb-0 text-[12px] font-semibold uppercase tracking-[0.18em]">
          <Aba href="/benx-journal" ativo={!cat}>Todos</Aba>
          {categorias.map((c) => (
            <Aba key={c} href={`/benx-journal?cat=${encodeURIComponent(c)}`} ativo={cat === c}>{c}</Aba>
          ))}
        </nav>

        {posts.length === 0 && (
          <p className="py-24 text-center text-[14px] text-black/50">Nenhuma matéria publicada ainda.</p>
        )}

        {/* destaque */}
        {destaque && (
          <article className="mt-10">
            <Link href={`/benx-journal/${destaque.slug}`} className="block overflow-hidden">
              {destaque.imagemUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={destaque.imagemUrl} alt={destaque.titulo} className="aspect-[16/7] w-full object-cover" />
              ) : <div className="aspect-[16/7] w-full bg-black/5" />}
            </Link>
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
              <div>
                {destaque.fonte && <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-black/45">{destaque.fonte}</p>}
                <Link href={`/benx-journal/${destaque.slug}`}>
                  <h2 className="mt-3 max-w-2xl font-serif text-[34px] leading-[1.15] text-[#1a1a1a] transition hover:text-[#0A4DCC] sm:text-[40px]">{destaque.titulo}</h2>
                </Link>
              </div>
              <div className="flex flex-col items-start gap-2 lg:items-end lg:text-right">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#b91c1c" }}>{destaque.categoria}</span>
                <span className="text-[12px] text-black/45">{dataBR(destaque.dataPublicacao)}</span>
                <Link href={`/benx-journal/${destaque.slug}`} className="mt-3 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.15em]" style={{ color: NAVY }}>
                  Ler matéria <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </article>
        )}

        {/* grid */}
        {resto.length > 0 && (
          <>
            <hr className="my-12 border-black/10" />
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {resto.map((p) => <CardJornal key={p.id} p={p} />)}
            </div>
          </>
        )}
      </div>

      <SiteFooter />
    </main>
  );
}

function Aba({ href, ativo, children }: { href: string; ativo: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`-mb-px border-b-2 pb-3 transition ${ativo ? "border-[#b91c1c] text-[#1a1a1a]" : "border-transparent text-black/45 hover:text-[#1a1a1a]"}`}
    >
      {children}
    </Link>
  );
}

function CardJornal({ p }: { p: PostResolvido }) {
  return (
    <article>
      <Link href={`/benx-journal/${p.slug}`} className="block overflow-hidden">
        {p.imagemUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.imagemUrl} alt={p.titulo} className="aspect-[16/10] w-full object-cover transition duration-300 hover:scale-[1.03]" />
        ) : <div className="aspect-[16/10] w-full bg-black/5" />}
      </Link>
      <div className="mt-3 flex items-center gap-3 text-[11px] uppercase tracking-[0.12em]">
        <span className="font-semibold" style={{ color: "#b91c1c" }}>{p.categoria}</span>
        <span className="text-black/40">{dataBR(p.dataPublicacao)}</span>
      </div>
      <Link href={`/benx-journal/${p.slug}`}>
        <h3 className="mt-2 font-serif text-[19px] leading-snug text-[#1a1a1a] transition hover:text-[#0A4DCC]">{p.titulo}</h3>
      </Link>
      {p.fonte && <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-black/40">{p.fonte}</p>}
    </article>
  );
}
