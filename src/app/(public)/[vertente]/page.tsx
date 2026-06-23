import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { vertentePorSlug, vertentePorValue, type VertenteValue } from "@/lib/ecossistema";
import {
  buscarEmpreendimentos,
  listarStatusObra,
  slidesDaVertente,
  cardsVertente,
  cardsPromo,
  bairrosDaVertente,
  listarPostsPublicos,
  type FiltrosBusca,
} from "@/db/queries";
import { seloUrlPorTipo } from "@/lib/selo";
import { getUrl } from "@/lib/storage";
import { lerStripConfig } from "@/lib/strip-config";
import { lerSeloConfig } from "@/lib/config";
import { statusObraLabel } from "@/lib/labels";
import { CardEmpreendimento } from "@/components/public/card-empreendimento";
import { HeroSlider } from "@/components/public/hero-slider";
import { JornalTopo } from "@/components/public/jornal/jornal-topo";
import { EmpreendimentosStrip } from "@/components/public/vertente/empreendimentos-strip";
import { ArquitetosSecao, ParqueGlobalSecao } from "@/components/public/vertente/home-editorial";
import { JornalCarrossel } from "@/components/public/vertente/jornal-carrossel";
import { Reveal } from "@/components/public/reveal";
import { SiteFooter } from "@/components/public/site-footer";

export const dynamic = "force-dynamic";

const COL = "mx-auto w-full max-w-site px-6";

export default async function HomeVertentePage({
  params,
  searchParams,
}: {
  params: Promise<{ vertente: string }>;
  searchParams: Promise<{ cidade?: string; bairro?: string; status?: string; page?: string }>;
}) {
  const { vertente } = await params;
  const info = vertentePorSlug(vertente);
  if (!info) notFound();

  const ehViva = info.value === "vivabenx";

  const sp = await searchParams;
  const temFiltro = !!(sp.status || sp.bairro || sp.cidade);
  const filtros: FiltrosBusca = {
    cidadeSlug: sp.cidade || undefined,
    bairroSlug: sp.bairro || undefined,
    status: (sp.status as FiltrosBusca["status"]) || undefined,
    pagina: sp.page ? Number(sp.page) : 1,
  };

  // "Conheça nossa linha {X}": cada home cruza para outra vertente.
  const PROMO: Record<string, VertenteValue> = {
    benx_iconicos: "benx",
    benx: "vivabenx",
    vivabenx: "benx",
  };
  const promoValue = PROMO[info.value] ?? "benx";
  const promoInfo = vertentePorValue(promoValue);

  const [slides, cards, promoCards, bairros, statusPresentes, busca, posts, stripCfg, seloCfg] = await Promise.all([
    slidesDaVertente(info.value),
    cardsVertente(info.value),
    cardsPromo(promoValue),
    bairrosDaVertente(info.value),
    listarStatusObra(info.value),
    temFiltro ? buscarEmpreendimentos(info.value, filtros) : Promise.resolve(null),
    listarPostsPublicos(),
    lerStripConfig(info.value),
    lerSeloConfig(),
  ]);

  // Só os valores REALMENTE presentes no banco (evita opções com value que não casa).
  const statusFacet = Array.from(new Set(statusPresentes.filter(Boolean)))
    .map((v) => ({ value: v, label: statusObraLabel(v) }))
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));

  const stripCards = cards.map((c) => ({
    href: `/${info.slug}/${c.slug}`,
    nome: c.nome,
    statusLabel: statusObraLabel(c.statusObra),
    imagemUrl: c.imagemUrl,
    seloUrl: c.seloUrl,
  }));

  return (
    <>
      {/* topo + hero */}
      <div className="relative">
        <JornalTopo marca={ehViva ? "vivabenx" : "benx"} homeHref={`/${vertente}`} />
        {slides.length > 0 ? (
          <HeroSlider slides={slides} />
        ) : (
          <div className="h-20 bg-[#0A2A66]" />
        )}
      </div>

      {/* faixa de empreendimentos */}
      {stripCards.length > 0 && (
        <section id="empreendimentos" data-reveal className="bg-white pt-12 pb-12">
          <EmpreendimentosStrip cards={stripCards} autoplay cols={stripCfg.cols} seloConfig={seloCfg} />
        </section>
      )}

      {temFiltro && busca ? (
        // ── resultados da busca ──
        <main className={`${COL} py-12`}>
          <div className="flex items-center justify-between">
            <h2 className="text-[22px] font-semibold tracking-tight" style={{ color: info.cor }}>
              {busca.total} {busca.total === 1 ? "resultado" : "resultados"}
            </h2>
            <Link href={`/${info.slug}`} className="text-[13px] font-medium text-accent hover:underline">Limpar filtros</Link>
          </div>
          {busca.itens.length === 0 ? (
            <p className="mt-10 text-center text-[14px] text-foreground-tertiary">Nenhum empreendimento encontrado.</p>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {await Promise.all(
                busca.itens.map(async (e) => (
                  <CardEmpreendimento
                    key={e.id}
                    href={`/${info.slug}/${e.slug}`}
                    nome={e.nome}
                    subtitulo={e.subtitulo ?? ""}
                    cidade={e.cidade?.nome ?? ""}
                    statusLabel={statusObraLabel(e.statusObra)}
                    vertenteLabel={info.label}
                    vertenteCor={info.cor}
                    vertenteBg={info.bg}
                    urlImagem={e.imagemPrincipal ? await getUrl(e.imagemPrincipal) : null}
                    seloUrl={ehViva ? seloUrlPorTipo(e.tipoHabitacao) : null}
                    seloConfig={seloCfg}
                  />
                ))
              )}
            </div>
          )}
        </main>
      ) : ehViva ? (
        // ── home curada Viva Benx ──
        <>
          {/* Plataforma Viva Benx: números + manifesto (fundo branco) */}
          <section className="bg-white">
            <Reveal className={`${COL} py-20`}>
              <div className="grid items-start gap-12 lg:grid-cols-[0.8fr_1.4fr] lg:gap-20">
                {/* números à esquerda */}
                <div className="flex flex-col gap-10 text-center sm:flex-row sm:justify-around lg:flex-col lg:gap-12 lg:text-left">
                  {[
                    { n: "+25", l: "Viva Benx" },
                    { n: "+7mil", l: "Famílias" },
                    { n: "+10", l: "Lançamentos" },
                  ].map((s) => (
                    <div key={s.l}>
                      <p className="text-[56px] font-semibold leading-none text-[#1577C0] sm:text-[64px]">{s.n}</p>
                      <p className="mt-2 text-[22px] font-light text-[#3a3a3a]">{s.l}</p>
                    </div>
                  ))}
                </div>

                {/* manifesto à direita */}
                <div>
                  <h2 className="text-[28px] font-semibold leading-[1.15] tracking-tight text-[#1577C0] sm:text-[36px] lg:text-[40px]">
                    Por acreditar que todos têm o direito de viver bem, a Benx criou{" "}
                    <span className="text-[#F47920]">a plataforma Viva Benx e mudou o jeito de viver em São Paulo</span>
                  </h2>
                  <p className="mt-8 max-w-2xl text-[15px] leading-relaxed text-[#5a5a5a]">
                    Por acreditar que todos têm o direito de viver bem, a Benx criou a plataforma Viva Benx e mudou o jeito de viver em São Paulo. Hoje, morar em bairros centrais, com localização privilegiada (próximo a parques, shoppings, transporte e ao trabalho) em empreendimentos com lazer de alto padrão que tem lobby com pé direito duplo, piscina com bangalô, espaço gourmet, cinema e coworking assinados por arquitetos renomados e por um preço imbatível, é uma realidade.
                  </p>
                  <Link href={`/${info.slug}#empreendimentos`} className="group mt-8 inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#1a3a6b]">
                    Ver empreendimentos <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1.5" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </section>

          {/* Escolha seu Viva Benx: carrossel de logos das marcas/empreendimentos */}
          {cards.length > 0 && (
            <section className={`${COL} py-20`}>
              <Reveal>
                <h2 className="text-center text-[30px] font-light tracking-tight text-[#1577C0] sm:text-[44px] lg:text-[48px]">
                  Escolha seu <span className="font-semibold">Viva Benx</span>
                </h2>
                <div className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                  {cards.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/${info.slug}/${c.slug}`}
                      className="group grid aspect-square place-items-center rounded-xl border border-[#e3e8ef] bg-white p-5 transition hover:border-[#1577C0] hover:shadow-md"
                    >
                      {c.logotipoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.logotipoUrl} alt={c.nome} className="max-h-44 w-auto max-w-full object-contain opacity-80 transition group-hover:opacity-100" />
                      ) : (
                        <span className="text-center text-[15px] font-semibold text-[#1577C0]">{c.nome}</span>
                      )}
                    </Link>
                  ))}
                </div>
              </Reveal>
            </section>
          )}

          {/* Conheça os empreendimentos Benx (cross-promo para a linha Benx) */}
          {promoCards.length > 0 && promoInfo && (
            <section className={`${COL} pb-20`}>
              <Reveal className="grid items-center gap-10 lg:grid-cols-[1fr_1.5fr]">
                <div>
                  <h2 className="text-[34px] font-light leading-[1.05] tracking-tight sm:text-[44px] lg:text-[52px]" style={{ color: "#1577C0" }}>
                    Conheça os<br />empreendimentos<br /><span className="font-semibold">Benx</span>
                  </h2>
                  <Link href={`/${promoInfo.slug}`} className="group mt-6 inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#1a3a6b]">
                    Ver empreendimentos <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1.5" />
                  </Link>
                </div>
                <EmpreendimentosStrip
                  autoplay
                  cardWidthClass="w-full sm:w-[calc(50%-0.5rem)]"
                  seloConfig={seloCfg}
                  cards={promoCards.map((c) => ({
                    href: `/${promoInfo.slug}/${c.slug}`,
                    nome: c.nome,
                    statusLabel: statusObraLabel(c.statusObra),
                    imagemUrl: c.imagemUrl,
                    seloUrl: c.seloUrl,
                  }))}
                />
              </Reveal>
            </section>
          )}

          {/* Benx Journal (carrossel) */}
          {posts.length > 0 && (
            <section className="bg-[#ececec]">
              <Reveal className={`${COL} py-16`}>
                <h2 className="text-[30px] font-light tracking-tight sm:text-[44px] lg:text-[50px]" style={{ color: "#1577C0" }}>Benx Journal</h2>
                <div className="mt-10">
                  <JornalCarrossel
                    posts={posts.map((p) => ({ slug: p.slug, fonte: p.fonte, titulo: p.titulo, resumo: p.resumo, imagemUrl: p.imagemUrl }))}
                  />
                </div>
                <div className="mt-12 text-center">
                  <Link href="/benx-journal" className="group inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em]" style={{ color: "#1577C0" }}>
                    Ver todas as notícias <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1.5" />
                  </Link>
                </div>
              </Reveal>
            </section>
          )}
        </>
      ) : (
        // ── home curada ──
        <>
          {/* 1. Arquitetos que inspiram */}
          <ArquitetosSecao />

          {/* 2. Conheça nossa linha {X}: cross-promo para outra vertente */}
          {promoCards.length > 0 && promoInfo && (
            <section className={`${COL} pt-12 pb-20`}>
              <Reveal className="grid items-center gap-10 lg:grid-cols-[1fr_1.5fr]">
                <div>
                  <h2 className="text-[34px] font-light leading-[1.05] tracking-tight text-[#0A2A66] sm:text-[52px] lg:text-[60px]">
                    Conheça<br />nossa linha<br /><span className="font-semibold">{promoInfo.label}</span>
                  </h2>
                  <Link href={`/${promoInfo.slug}`} className="group mt-6 inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#0A2A66]">
                    Ver empreendimentos <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1.5" />
                  </Link>
                </div>
                <EmpreendimentosStrip
                  autoplay
                  cardWidthClass="w-full sm:w-[calc(50%-0.5rem)]"
                  seloConfig={seloCfg}
                  cards={promoCards.map((c) => ({
                    href: `/${promoInfo.slug}/${c.slug}`,
                    nome: c.nome,
                    statusLabel: statusObraLabel(c.statusObra),
                    imagemUrl: c.imagemUrl,
                    seloUrl: c.seloUrl,
                  }))}
                />
              </Reveal>
            </section>
          )}

          {/* 3. Parque Global */}
          <ParqueGlobalSecao />

          {/* 4. Benx Journal (carrossel) */}
          {posts.length > 0 && (
            <section className="bg-[#ececec]">
              <Reveal className={`${COL} py-16`}>
                <h2 className="text-[30px] font-light tracking-tight sm:text-[44px] lg:text-[50px]" style={{ color: "#0A2A66" }}>Benx Journal</h2>
                <div className="mt-10">
                  <JornalCarrossel
                    posts={posts.map((p) => ({ slug: p.slug, fonte: p.fonte, titulo: p.titulo, resumo: p.resumo, imagemUrl: p.imagemUrl }))}
                  />
                </div>
                <div className="mt-12 text-center">
                  <Link href="/benx-journal" className="group inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em]" style={{ color: "#0A2A66" }}>
                    Ver todas as notícias <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1.5" />
                  </Link>
                </div>
              </Reveal>
            </section>
          )}
        </>
      )}

      <SiteFooter variant={ehViva ? "vivabenx" : "padrao"} />
    </>
  );
}
