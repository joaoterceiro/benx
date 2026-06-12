import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { vertentePorSlug, vertentePorValue } from "@/lib/ecossistema";
import {
  empreendimentoPublicoPorSlug,
  plantasDoEmpreendimento,
  midiasDoEmpreendimento,
  empreendimentosPorSlugs,
} from "@/db/queries";
import { getUrl } from "@/lib/storage";
import { statusObraLabel, tipoHabitacaoLabel } from "@/lib/labels";
import { LeadForm } from "@/components/public/lead-form";
import { CardEmpreendimento } from "@/components/public/card-empreendimento";
import { ProdutoBenx, type ProdutoBenxDados } from "@/components/public/produto/produto-benx";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ vertente: string; slug: string }> }): Promise<Metadata> {
  const { vertente, slug } = await params;
  const info = vertentePorSlug(vertente);
  if (!info) return {};
  const e = await empreendimentoPublicoPorSlug(info.value, slug);
  if (!e) return { title: "Empreendimento não encontrado" };
  const titulo = (e.seoTitulo || e.nome || "").trim();
  const limpar = (s?: string | null) => (s ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() || undefined;
  const descricao = limpar(e.seoDescricao) || limpar(e.subtitulo);
  const imagem = e.imagemPrincipal ? await getUrl(e.imagemPrincipal) : undefined;
  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: `/${vertente}/${slug}` },
    openGraph: { title: titulo, description: descricao, type: "website", url: `/${vertente}/${slug}`, images: imagem ? [{ url: imagem }] : undefined },
    twitter: { card: imagem ? "summary_large_image" : "summary", title: titulo, description: descricao, images: imagem ? [imagem] : undefined },
  };
}

export default async function EmpreendimentoPage({
  params,
}: {
  params: Promise<{ vertente: string; slug: string }>;
}) {
  const { vertente, slug } = await params;
  const info = vertentePorSlug(vertente);
  if (!info) notFound();

  const e = await empreendimentoPublicoPorSlug(info.value, slug);
  if (!e) notFound();

  const urlImagem = e.imagemPrincipal ? await getUrl(e.imagemPrincipal) : null;
  const plantas = e.exibirPlantas ? await plantasDoEmpreendimento(e.id) : [];
  const midias = await midiasDoEmpreendimento(e.id);
  const fachada = midias.filter((m) => m.tipo === "fachada");
  const areas = midias.filter((m) => m.tipo === "area_comum");
  const obra = e.exibirObras ? midias.filter((m) => m.tipo === "obra") : [];

  const relacionados = e.relacionados?.length ? await empreendimentosPorSlugs(e.relacionados) : [];
  const relCards = await Promise.all(
    relacionados
      .filter((r) => r.slug !== e.slug)
      .map(async (r) => {
        const v = vertentePorValue(r.linhaProduto?.slug ?? "");
        return {
          href: v ? `/${v.slug}/${r.slug}` : "#",
          nome: r.nome,
          subtitulo: r.subtitulo ?? "",
          cidade: r.cidade?.nome ?? "",
          statusLabel: statusObraLabel(r.statusObra),
          vertenteLabel: v?.label ?? "",
          vertenteCor: v?.cor ?? info.cor,
          vertenteBg: v?.bg ?? info.bg,
          urlImagem: r.imagemPrincipal ? await getUrl(r.imagemPrincipal) : null,
        };
      })
  );

  // ── Layout dedicado da página de produto (clone fiel) ──
  // Mesma estrutura para Benx, Benx Icônicos e Viva Benx; só muda o tema (marca).
  if (info.value === "benx" || info.value === "benx_iconicos" || info.value === "vivabenx") {
    const ehViva = info.value === "vivabenx";
    const limpar = (s?: string | null) =>
      (s ?? "")
        .replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n").replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

    const plantasBenx = await Promise.all(
      plantas.map(async (p) => ({
        nome: p.nome,
        metragem: p.metragem != null ? String(p.metragem) : "",
        dormitorios: p.dormitorios != null ? String(p.dormitorios) : "",
        suites: p.suites != null ? String(p.suites) : "",
        vagas: p.vagas != null ? String(p.vagas) : "",
        recursos: p.recursos ?? [],
        url: p.imagemPlanta ? await getUrl(p.imagemPlanta) : null,
      }))
    );

    const areasItems = (e.areasComuns ?? []) as { nome: string; imagem?: string }[];
    const areasImgs = (await Promise.all(areasItems.map((a) => (a.imagem ? getUrl(a.imagem) : Promise.resolve(null))))).filter((u): u is string => !!u);
    const areasImagens = areasImgs.length ? areasImgs : fachada.map((m) => m.url);
    const areasNomes = areasItems.map((a) => a.nome).filter((n) => n && !/^Área comum \d+$/i.test(n));
    const encEnd = encodeURIComponent([e.enderecoParcial || e.enderecoCompleto, e.bairro?.nome, e.cidade?.nome].filter(Boolean).join(", "));

    const specs = [
      { label: ehViva ? "Metragem" : "Metragem Residencial", valor: e.metragemResidencial ?? "" },
      ...(ehViva ? [
        { label: "Quartos", valor: e.quartos ?? "" },
        { label: "Vagas", valor: e.vagas ?? "" },
      ] : []),
      { label: "Endereço", valor: e.enderecoCompleto ?? e.enderecoParcial ?? "" },
      { label: "Bairro", valor: e.bairro?.nome ?? "" },
      { label: "Cidade", valor: e.cidade ? `${e.cidade.nome}${e.cidade.estado ? `/${e.cidade.estado}` : ""}` : "" },
      { label: "Unidades", valor: e.totalUnidades != null ? String(e.totalUnidades) : "" },
      { label: "Andares", valor: e.totalAndares != null ? String(e.totalAndares) : "" },
      { label: "Torres", valor: e.numeroTorres != null ? String(e.numeroTorres) : "" },
      { label: "Terreno", valor: e.areaTerreno ? `${Number(e.areaTerreno).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m²` : "" },
      { label: "Arquitetura", valor: e.arquitetura ?? "" },
      { label: "Paisagismo", valor: e.paisagismo ?? "" },
      { label: "Interiores", valor: e.interiores ?? "" },
    ].filter((s) => s.valor.trim() !== "");

    // Banner HIS só no Viva Benx, quando o empreendimento tem habitação social.
    const hisLabel = ehViva && e.tipoHabitacao && e.tipoHabitacao !== "mercado"
      ? tipoHabitacaoLabel(e.tipoHabitacao)
      : undefined;

    // Selo Prefeitura de SP conforme a classificação do imóvel (Viva Benx).
    const SELO_POR_TIPO: Record<string, string> = {
      his: "/selos/his.jpg",
      hmp: "/selos/hmp.jpg",
      his_e_hmp: "/selos/his-hmp.jpg",
    };
    const selo = ehViva && e.tipoHabitacao ? SELO_POR_TIPO[e.tipoHabitacao] ?? null : null;

    const dados: ProdutoBenxDados = {
      nome: e.nome,
      subtitulo: limpar(e.subtitulo),
      statusLabel: statusObraLabel(e.statusObra),
      oProjeto: limpar(e.oProjeto),
      textoLegal: limpar(e.textoLegal),
      specs,
      heroUrl: urlImagem ?? fachada[0]?.url ?? null,
      projetoUrl: fachada[0]?.url ?? urlImagem ?? null,
      statementUrl: fachada[2]?.url ?? fachada[1]?.url ?? areasImagens[0] ?? null,
      galeria: fachada.map((m) => ({ url: m.url, alt: m.alt || e.nome })),
      areasNomes,
      areasImagens,
      diferenciais: e.diferenciais ?? [],
      plantas: plantasBenx,
      tourUrl: e.urlTourVirtual || undefined,
      videoUrl: e.vistasDoAndar || e.urlVideoPrincipal || undefined,
      videoPrincipal: e.urlVideoPrincipal || null,
      videoThumb: e.thumbnailVideo ? await getUrl(e.thumbnailVideo) : null,
      localizacao: {
        endereco: e.enderecoParcial || e.enderecoCompleto || "",
        regiao: [e.bairro?.nome, e.cidade ? `${e.cidade.nome}${e.cidade.estado ? `/${e.cidade.estado}` : ""}` : ""].filter(Boolean).join(" "),
        pontos: (e.detalhesLocalizacao ?? []).map((p) => ({ titulo: p.titulo, distancia: p.distancia ?? "" })),
        uber: e.linkUber || `https://m.uber.com/ul/?action=setPickup&dropoff[formatted_address]=${encEnd}`,
        maps: e.linkMaps || `https://www.google.com/maps/search/?api=1&query=${encEnd}`,
        waze: e.linkWaze || `https://waze.com/ul?q=${encEnd}&navigate=yes`,
        standDeVendas: e.standDeVendas || undefined,
      },
      contato: { empreendimentoId: e.id, origem: e.slug },
      relacionados: relCards.map((r) => ({ href: r.href, nome: r.nome, statusLabel: r.statusLabel, urlImagem: r.urlImagem })),
      marca: ehViva ? "vivabenx" : "benx",
      his: hisLabel,
      selo,
      homeHref: `/${vertente}`,
    };
    return <ProdutoBenx dados={dados} />;
  }

  const caracteristicas = [
    ["Unidades", e.totalUnidades],
    ["Torres", e.numeroTorres],
    ["Andares", e.totalAndares],
    ["Quartos", e.quartos],
    ["Vagas", e.vagas],
    ["Metragem", e.metragemResidencial],
  ].filter(([, v]) => v !== null && v !== undefined && v !== "");

  return (
    <main className="mx-auto max-w-site px-6 py-12">
      <Link href={`/${info.slug}`} className="text-sm text-foreground-secondary hover:text-foreground">
        ← {info.label}
      </Link>

      <div
        className="relative mt-4 flex aspect-[16/7] w-full items-end overflow-hidden rounded-xl p-6"
        style={{ background: `linear-gradient(135deg, ${info.bg}, var(--bg-muted))` }}
      >
        {urlImagem ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={urlImagem} alt={e.nome} className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="rounded-md px-2 py-0.5 text-[11px] font-semibold text-white" style={{ background: info.cor }}>
          {info.label}
        </span>
        <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground-secondary">
          {statusObraLabel(e.statusObra)}
        </span>
        {e.tipoHabitacao ? (
          <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground-secondary">
            {tipoHabitacaoLabel(e.tipoHabitacao)}
          </span>
        ) : null}
      </div>

      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{e.nome}</h1>
      {e.subtitulo ? <p className="mt-1 text-foreground-secondary">{e.subtitulo}</p> : null}
      {e.cidade ? (
        <p className="mt-1 text-sm text-foreground-tertiary">
          {e.cidade.nome}{e.cidade.estado ? `, ${e.cidade.estado}` : ""}
        </p>
      ) : null}

      {e.oProjeto ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold tracking-tight">O projeto</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground-secondary">{e.oProjeto}</p>
        </section>
      ) : null}

      {caracteristicas.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold tracking-tight">Características</h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {caracteristicas.map(([k, v]) => (
              <div key={String(k)} className="rounded-lg border border-border bg-surface p-3 shadow-xs">
                <dt className="text-[12px] text-foreground-tertiary">{k}</dt>
                <dd className="text-[15px] font-medium">{String(v)}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {(e.diferenciais?.length ?? 0) > 0 ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold tracking-tight">Diferenciais</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {e.diferenciais!.map((d, i) => (
              <li key={i} className="rounded-full bg-muted px-3 py-1 text-[13px] text-foreground-secondary">{d}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {fachada.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold tracking-tight">Fachada</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {fachada.map((m) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={m.id} src={m.url} alt={m.alt || e.nome} className="aspect-[4/3] w-full rounded-lg border border-border object-cover" />
            ))}
          </div>
        </section>
      ) : null}

      {areas.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold tracking-tight">Áreas comuns</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {areas.map((m) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={m.id} src={m.url} alt={m.alt || e.nome} className="aspect-[4/3] w-full rounded-lg border border-border object-cover" />
            ))}
          </div>
        </section>
      ) : null}

      {e.exibirObras && e.obraTotal !== null ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold tracking-tight">Andamento da obra</h2>
          <div className="mt-3">
            <div className="flex justify-between text-[12px] text-foreground-secondary">
              <span>Total</span><span>{e.obraTotal}%</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full" style={{ width: `${e.obraTotal}%`, background: info.cor }} />
            </div>
          </div>
          {obra.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {obra.map((m) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={m.id} src={m.url} alt={m.alt || e.nome} className="aspect-[4/3] w-full rounded-lg border border-border object-cover" />
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {plantas.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold tracking-tight">Plantas</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {plantas.map((p) => (
              <div key={p.id} className="rounded-lg border border-border bg-surface p-4 shadow-xs">
                <h3 className="text-[14px] font-semibold">{p.nome}</h3>
                <p className="mt-1 text-[12px] text-foreground-secondary">
                  {[p.metragem ? `${p.metragem} m²` : null, p.dormitorios ? `${p.dormitorios} dorm.` : null, p.vagas ? `${p.vagas} vagas` : null]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {e.exibirLocalizacao && e.enderecoCompleto ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold tracking-tight">Localização</h2>
          <p className="mt-2 text-sm text-foreground-secondary">{e.enderecoCompleto}</p>
        </section>
      ) : null}

      {relCards.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold tracking-tight">Empreendimentos relacionados</h2>
          <div className="mt-3 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relCards.map((c) => (
              <CardEmpreendimento key={c.href} {...c} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">Tenho interesse</h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          Deixe seu contato e a equipe falará com você sobre o {e.nome}.
        </p>
        <div className="mt-3">
          <LeadForm empreendimentoId={e.id} origem={e.slug} cor={info.cor} />
        </div>
      </section>
    </main>
  );
}
