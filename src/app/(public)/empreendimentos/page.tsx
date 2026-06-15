import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import {
  todosSlides,
  buscarGlass,
  listarBairros,
  listarCategorias,
  type BuscaFiltros,
} from "@/db/queries";
import { lerSeloConfig } from "@/lib/config";
import { JornalTopo } from "@/components/public/jornal/jornal-topo";
import { HeroSlider } from "@/components/public/hero-slider";
import { EmpreendimentosStrip } from "@/components/public/vertente/empreendimentos-strip";
import { CatalogoFiltros } from "@/components/public/empreendimentos/catalogo-filtros";
import { SeloTag } from "@/components/public/selo-tag";
import { SiteFooter } from "@/components/public/site-footer";

export const metadata: Metadata = {
  title: "Empreendimentos",
  description: "Conheça todos os empreendimentos Benx: lançamentos, em construção e prontos para morar. Filtre por bairro, tipo e tipologia.",
};

export const dynamic = "force-dynamic";

const COL = "mx-auto w-full max-w-site px-6";

const TIPOLOGIAS = [
  { value: "1", label: "1 dormitório" },
  { value: "2", label: "2 dormitórios" },
  { value: "3", label: "3 dormitórios" },
  { value: "4", label: "4+ dormitórios" },
];

export default async function EmpreendimentosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; bairro?: string; tipo?: string; tipologia?: string }>;
}) {
  const sp = await searchParams;
  const filtros: BuscaFiltros = {
    status: sp.status || undefined,
    bairro: sp.bairro || undefined,
    categoria: sp.tipo || undefined,
  };

  const [slides, todos, lista, bairros, categorias, seloCfg] = await Promise.all([
    todosSlides(),
    buscarGlass({}),
    buscarGlass(filtros),
    listarBairros(),
    listarCategorias(),
    lerSeloConfig(),
  ]);

  return (
    <>
      {/* topo + hero slider */}
      <div className="relative">
        <JornalTopo />
        {slides.length > 0 ? <HeroSlider slides={slides} /> : <div className="h-20 bg-[#0a2a66]" />}
      </div>

      {/* faixa de empreendimentos */}
      {todos.items.length > 0 && (
        <section className="bg-white pt-12 pb-12">
          <EmpreendimentosStrip
            autoplay
            aspectClass="aspect-[4/3]"
            cards={todos.items.map((c) => ({ href: c.url, nome: c.nome, statusLabel: c.status, imagemUrl: c.img }))}
          />
        </section>
      )}

      {/* filtros */}
      <section className={`${COL} pb-4`}>
        <CatalogoFiltros
          status={sp.status}
          bairro={sp.bairro}
          tipo={sp.tipo}
          tipologia={sp.tipologia}
          bairroOpts={bairros.map((b) => ({ value: b.slug, label: b.nome }))}
          tipoOpts={categorias.map((c) => ({ value: c.slug, label: c.nome }))}
          tipologiaOpts={TIPOLOGIAS}
        />
      </section>

      {/* lista vertical */}
      <section id="lista" className={`${COL} scroll-mt-24 py-10`}>
        {lista.items.length === 0 ? (
          <p className="py-16 text-center text-[15px] text-foreground-tertiary">Nenhum empreendimento encontrado com esses filtros.</p>
        ) : (
          <div className="flex flex-col gap-8">
            {lista.items.map((e) => (
              <Link
                key={e.id}
                href={e.url}
                className="group grid items-stretch overflow-hidden border border-black/[0.06] bg-[#f6f7f9] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-500 ease-premium hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(10,42,102,0.12)] sm:grid-cols-[1.8fr_1fr]"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#e9edf3]">
                  <Image src={e.img || "/placeholder-card.jpg"} alt={e.nome} fill sizes="(max-width: 640px) 100vw, 64vw" loading="lazy" className="object-cover transition-transform duration-[800ms] ease-premium group-hover:scale-[1.06]" />
                  {e.seloUrl && <SeloTag url={e.seloUrl} config={seloCfg} />}
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>
                <div className="flex flex-col justify-between px-8 py-9">
                  <div>
                    {e.status && (
                      <span className="inline-block bg-[#0a2a66]/[0.07] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0a2a66]">
                        {e.status}
                      </span>
                    )}
                    <h3 className="mt-3 text-[28px] font-light leading-tight tracking-tight transition-colors duration-300 group-hover:text-[#0a2a66] sm:text-[34px]" style={{ color: "#3a3a3a" }}>
                      {e.nome}
                    </h3>
                    <p className="mt-2 text-[14px] text-[#7a7a7a]">
                      {[e.bairro, `${e.cidade}${e.uf ? `/${e.uf}` : ""}`].filter((s) => s && s !== "/").join(" - ")}
                    </p>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <span className="inline-flex items-center gap-2 border border-[#0a2a66]/30 px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#0a2a66] transition-colors duration-300 group-hover:border-[#0a2a66] group-hover:bg-[#0a2a66] group-hover:text-white">
                      Conhecer <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </>
  );
}
