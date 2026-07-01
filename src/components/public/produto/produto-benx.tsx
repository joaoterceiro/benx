import Link from "next/link";
import Image from "next/image";
import { CorretorForm } from "./corretor-form";
import { WhatsAppContexto } from "@/components/public/whatsapp-float";
import { SiteFooter } from "@/components/public/site-footer";
import { ProdutoHeader } from "./produto-header";
import { AnchorNav, Carrossel, GaleriaCarrossel, PlantasLista, PontosCarrossel, Compartilhar, VideoFacade, type PlantaItem } from "./interativos";
import { InfoHabitacao } from "./info-habitacao";
import type { VarianteInfo } from "@/lib/info-habitacao";

// Paletas por marca. A página de produto é a mesma; só muda o tema.
const TEMAS = {
  benx:     { titulo: "#0a2a66", reserve: "#0A4DCC", contato: "#0a2a66", tour: "#0a2a66", verLink: "#0A4DCC" },
  vivabenx: { titulo: "#1577C0", reserve: "#1577C0", contato: "#E0452A", tour: "#F47920", verLink: "#1577C0" },
} as const;
type Marca = keyof typeof TEMAS;

// Largura da coluna de conteúdo do site.
const COL = "mx-auto w-full max-w-site px-6";

export interface ProdutoBenxDados {
  nome: string;
  subtitulo: string;
  statusLabel: string;
  oProjeto: string;
  textoLegal: string;
  specs: { label: string; valor: string }[];
  heroUrl: string | null;
  projetoUrl: string | null;
  statementUrl: string | null;
  galeria: { url: string; alt: string }[];
  areasNomes: string[];
  areasImagens: string[];
  diferenciais: string[];
  certificacoes: { nome: string; imagemUrl: string | null }[];
  plantas: PlantaItem[];
  tourUrl?: string;
  videoUrl?: string;
  /** Vídeo principal (YouTube/Vimeo) exibido na seção de destaque. */
  videoPrincipal?: string | null;
  videoThumb?: string | null;
  localizacao: { endereco: string; regiao: string; pontos: { titulo: string; imagemUrl?: string | null }[]; uber: string; maps: string; waze: string; standDeVendas?: string };
  contato: { empreendimentoId: string; origem: string };
  relacionados: { href: string; nome: string; statusLabel: string; urlImagem: string | null }[];
  /** Marca/tema da página. Default "benx". */
  marca?: Marca;
  /** Rótulo do tipo de habitação social (ex.: "HIS", "HIS e HMP"). Mostra o banner amarelo quando presente. */
  his?: string;
  /** Variante de "Informações importantes" (HIS/HMP) já resolvida pelo server. */
  infoHabitacao?: VarianteInfo | null;
  selo?: string | null;
  homeHref?: string;
}

const NAV = [
  { id: "projeto", label: "O Projeto" },
  { id: "galeria", label: "Galeria" },
  { id: "areas", label: "Áreas Comuns" },
  { id: "diferenciais", label: "Diferenciais" },
  { id: "plantas", label: "Plantas" },
  { id: "localizacao", label: "Localização" },
  { id: "contato", label: "Contato" },
];

export function ProdutoBenx({ dados: d }: { dados: ProdutoBenxDados }) {
  const marca: Marca = d.marca ?? "benx";
  const tema = TEMAS[marca];
  // Destaque (subtítulo): garante espaço após pontuação (ex.: "distantes.Você")
  // e separa a 1ª frase (bold) do restante (regular) — o <strong> do original
  // some no import, então recriamos o padrão na exibição.
  const subClean = d.subtitulo.replace(/([.!?])(?=\p{Lu})/gu, "$1 ");
  const subMatch = subClean.match(/^(.*?[.!?])\s+(.*)$/s);
  const subLead = subMatch ? subMatch[1] : subClean;
  const subResto = subMatch ? subMatch[2] : "";
  const Heading = ({ children, center }: { children: React.ReactNode; center?: boolean }) => (
    <h2 className={`text-[32px] font-normal leading-[1.08] sm:text-[50px] ${center ? "text-center" : ""}`} style={{ color: tema.titulo }}>
      {children}
    </h2>
  );
  const navItens = NAV.filter((n) =>
    n.id === "projeto" ||
    (n.id === "galeria" && d.galeria.length) ||
    (n.id === "areas" && (d.areasImagens.length || d.areasNomes.length)) ||
    (n.id === "diferenciais" && d.diferenciais.length) ||
    (n.id === "plantas" && d.plantas.length) ||
    (n.id === "localizacao" && d.localizacao.endereco) ||
    n.id === "contato"
  );
  const mapaSrc = d.localizacao.endereco
    ? `https://maps.google.com/maps?q=${encodeURIComponent(`${d.localizacao.endereco} ${d.localizacao.regiao}`)}&output=embed&hl=pt-BR&z=16`
    : null;

  return (
    <div className="bg-white text-[#1a2230]">
      <WhatsAppContexto nome={d.nome} />


      {/* HERO */}
      <header className="relative flex h-[56vh] min-h-[400px] flex-col justify-end overflow-hidden">
        {d.heroUrl ? (
          <Image src={d.heroUrl} alt={d.nome} fill priority sizes="100vw" className="object-cover kenburns" />
        ) : <div className="absolute inset-0" style={{ background: tema.titulo }} />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/45" />

        <ProdutoHeader marca={marca} homeHref={d.homeHref ?? "/"} navItens={navItens} />

        {d.selo && (
          <div className="pointer-events-none absolute inset-x-0 bottom-28 z-10 hidden sm:block">
            <div className={COL}>
              <div className="flex justify-end">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.selo} alt="Selo Prefeitura de São Paulo - habitação de interesse social" className="h-[120px] w-auto drop-shadow-[0_8px_24px_rgba(0,0,0,.45)]" />
              </div>
            </div>
          </div>
        )}

        <div className={`relative z-10 ${COL} pb-10`}>
          {d.statusLabel && (
            <span className="inline-block border border-white/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/90">
              {d.statusLabel}
            </span>
          )}
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-[40px]">{d.nome}</h1>
            <Compartilhar />
          </div>
        </div>
      </header>

      <AnchorNav itens={navItens} />

      {/* O PROJETO */}
      <section id="projeto" className={`${COL} scroll-mt-[140px] py-16`}>
        <div className="grid gap-x-12 gap-y-5 sm:grid-cols-2 sm:items-center">
          <Heading>O Projeto</Heading>
          {d.oProjeto && (
            <div className="rt-conteudo text-[17px] leading-[1.7] sm:text-[19px]" style={{ color: "#3a4760" }} dangerouslySetInnerHTML={{ __html: d.oProjeto }} />
          )}
        </div>

        <div className="mt-12 grid gap-10 sm:grid-cols-2 sm:items-start">
          {d.specs.length > 0 && (
            <dl className="divide-y divide-black/10 border-y border-black/10">
              {d.specs.map((s) => (
                <div key={s.label} className="flex items-baseline justify-between gap-6 py-4">
                  <dt className="shrink-0 text-[16px] sm:text-[18px]" style={{ color: "#5b6577" }}>{s.label}:</dt>
                  <dd className="text-right text-[16px] sm:text-[18px]" style={{ color: tema.titulo }}>{s.valor}</dd>
                </div>
              ))}
            </dl>
          )}
          {d.projetoUrl ? (
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              <Image src={d.projetoUrl} alt={d.nome} fill sizes="(max-width: 640px) 100vw, 50vw" loading="lazy" className="object-cover" />
            </div>
          ) : null}
        </div>
      </section>

      {/* GALERIA (full-bleed) */}
      {d.galeria.length > 0 && (
        <section id="galeria" data-reveal className="scroll-mt-[140px] py-2">
          <GaleriaCarrossel imagens={d.galeria} />
        </section>
      )}

      {/* STATEMENT (subtítulo + vídeo ou imagem) */}
      {(d.subtitulo || d.videoPrincipal || d.statementUrl) && (
        <section id="video" data-reveal className={`${COL} scroll-mt-[140px] py-16`}>
          <div className="grid items-center gap-8 sm:grid-cols-2">
            <div>
              {marca === "vivabenx" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src="/logo-vivabenx.svg" alt="Viva Benx" className="mb-5 h-10 w-auto" />
              )}
              {d.subtitulo ? (
                <p className="text-[26px] leading-[1.18] tracking-tight sm:text-[34px]">
                  <strong className="font-bold text-[#262626]">{subLead}</strong>
                  {subResto ? <span className="font-normal text-[#5b5b5b]"> {subResto}</span> : null}
                </p>
              ) : null}
            </div>
            {d.videoPrincipal ? (
              <div className="relative aspect-video w-full overflow-hidden">
                <VideoFacade url={d.videoPrincipal} poster={d.videoThumb} titulo={d.nome} />
              </div>
            ) : d.statementUrl ? (
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image src={d.statementUrl} alt={d.nome} fill sizes="(max-width: 640px) 100vw, 50vw" loading="lazy" className="object-cover" />
              </div>
            ) : null}
          </div>
        </section>
      )}

      {/* ÁREAS COMUNS */}
      {(d.areasImagens.length > 0 || d.areasNomes.length > 0) && (
        <section id="areas" data-reveal className="scroll-mt-[140px] bg-[#f6f7f9] py-16">
          <div className={`${COL} grid gap-12 sm:grid-cols-2 sm:items-center`}>
            {d.areasImagens.length > 0 ? (
              <GaleriaCarrossel imagens={d.areasImagens.map((u) => ({ url: u, alt: "Área comum" }))} cols={1} aspect="4 / 5" />
            ) : <div />}
            <div>
              <Heading>Áreas Comuns</Heading>
              {d.areasNomes.length > 0 && (
                <ul className="mt-6 grid grid-cols-1 border-t border-black/10 sm:grid-cols-2 sm:gap-x-10">
                  {d.areasNomes.map((a, i) => (
                    <li key={i} className="border-b border-black/10 py-3 text-[15px] sm:text-[16px]" style={{ color: "#3a4760" }}>{a}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}

      {/* DIFERENCIAIS */}
      {d.diferenciais.length > 0 && (
        <section id="diferenciais" data-reveal className={`${COL} scroll-mt-[140px] py-16`}>
          <Heading>Diferenciais das áreas comuns</Heading>
          <ul className="mt-8 border-t border-black/[0.12]">
            {d.diferenciais.map((t, i) => (
              <li key={i} className="border-b border-black/[0.12]">
                <div className="flex items-center gap-5 py-6 pl-4 sm:pl-10">
                  <span className="shrink-0 text-[22px] font-bold leading-none text-[#1a1a1a]" aria-hidden>+</span>
                  <span className="text-[15px] text-[#333] sm:text-[16px]">{t}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* CERTIFICAÇÕES */}
      {d.certificacoes.length > 0 && (
        <section id="certificacoes" data-reveal className={`${COL} scroll-mt-[140px] py-16`}>
          <Heading center>Certificações</Heading>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-10">
            {d.certificacoes.map((c, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                {c.imagemUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.imagemUrl} alt={c.nome} className="h-20 w-auto max-w-[200px] object-contain" />
                ) : (
                  <span className="text-[18px] font-semibold" style={{ color: tema.titulo }}>{c.nome}</span>
                )}
                {c.imagemUrl && c.nome && <span className="text-[13px] text-[#666]">{c.nome}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PLANTAS */}
      {d.plantas.length > 0 && (
        <section id="plantas" data-reveal className={`${COL} scroll-mt-[140px] py-16`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Heading>Plantas</Heading>
            {/* Botões só aparecem quando há a URL no admin (sem link vazio). */}
            {(d.tourUrl || d.videoUrl) && (
              <div className="flex flex-wrap gap-3">
                {d.tourUrl && (
                  <a href={d.tourUrl} target="_blank" rel="noopener noreferrer" className="px-8 py-3.5 text-[13px] font-semibold uppercase tracking-wide text-white transition hover:opacity-90 active:scale-[0.98]" style={{ background: tema.tour }}>Tour Virtual</a>
                )}
                {d.videoUrl && (
                  <a href={d.videoUrl} target="_blank" rel="noopener noreferrer" className="border px-8 py-3.5 text-[13px] font-semibold uppercase tracking-wide transition hover:bg-black/[0.03] active:scale-[0.98]" style={{ borderColor: tema.titulo, color: tema.titulo }}>Vistas do Andar</a>
                )}
              </div>
            )}
          </div>
          <div className="mt-6">
            <PlantasLista plantas={d.plantas} />
          </div>
        </section>
      )}

      {/* LOCALIZAÇÃO */}
      {(d.localizacao.endereco || d.localizacao.pontos.length > 0) && (
        <section id="localizacao" data-reveal className="scroll-mt-[140px] bg-white">
          <div className={`${COL} flex flex-col py-16 lg:h-[600px] lg:flex-row lg:items-stretch lg:py-0`}>
            {/* esquerda: título + pontos + apps */}
            <div className="relative z-10 flex flex-col lg:w-[44%] lg:shrink-0 lg:py-12 lg:pr-6">
              <div className="text-right">
                <Heading>Localização</Heading>
                {d.localizacao.endereco && <p className="mt-3 text-[14px] text-[#555]">{d.localizacao.endereco}</p>}
                {d.localizacao.regiao && <p className="text-[14px] text-[#555]">{d.localizacao.regiao}</p>}
              </div>
              {d.localizacao.pontos.length > 0 && (
                <div className="relative mt-7 lg:w-[140%]">
                  <PontosCarrossel pontos={d.localizacao.pontos} />
                </div>
              )}
              {d.localizacao.standDeVendas && (
                <div className="mt-7 text-right">
                  <h3 className="text-[24px] font-normal sm:text-[30px]" style={{ color: tema.titulo }}>Stand de Vendas</h3>
                  <p className="mt-1 text-[14px] text-[#555]">{d.localizacao.standDeVendas}</p>
                </div>
              )}
              <div className="mt-8 flex flex-wrap justify-end gap-4">
                <AppIcon href={d.localizacao.uber} src="/apps/uber.svg" label="Uber" bg="#1a1a1a" />
                <AppIcon href={d.localizacao.maps} src="/apps/maps.svg" label="Google Maps" bg="#ffffff" border />
                <AppIcon href={d.localizacao.waze} src="/apps/waze.svg" label="Waze" bg="#33cccc" />
              </div>
            </div>
            {/* direita: mapa */}
            <div className="relative z-0 mt-8 h-[320px] flex-1 lg:mt-0 lg:h-auto lg:py-8">
              {mapaSrc && (
                <div className="h-full w-full overflow-hidden shadow-[0_6px_28px_rgba(0,0,0,0.12)]">
                  <iframe title="Mapa" src={mapaSrc} className="h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CONSULTE UM CORRETOR */}
      <section id="contato" data-reveal className="scroll-mt-[140px]" style={{ background: tema.contato }}>
        <div className={`${COL} grid gap-10 py-16 sm:grid-cols-2 sm:items-center`}>
          <div className="text-white">
            <h2 className="text-[34px] font-normal leading-[1.1] sm:text-[44px]">Consulte um corretor</h2>
            <p className="mt-5 max-w-sm text-[16px] leading-relaxed text-white/85 sm:text-[18px]">
              Um time de especialistas à sua disposição. Conheça nossos imóveis
            </p>
          </div>
          <CorretorForm empreendimentoId={d.contato.empreendimentoId} origem={d.contato.origem} />
        </div>
      </section>

      {/* TEXTO LEGAL */}
      {d.textoLegal && (
        <section className={`${COL} py-10`}>
          <p className="whitespace-pre-line text-[11px] leading-relaxed text-foreground-tertiary">{d.textoLegal}</p>
        </section>
      )}

      {/* INFORMAÇÕES IMPORTANTES (HIS/HMP) — colapsável, conforme o tipo */}
      <InfoHabitacao variante={d.infoHabitacao} cor={tema.titulo} />

      {/* OUTROS DESTAQUES */}
      {d.relacionados.length > 0 && (
        <section className={`${COL} py-12`}>
          <div className="grid gap-8 sm:grid-cols-[1fr_200px] sm:items-center">
            <Carrossel>
              {d.relacionados.map((r) => (
                <Link key={r.href} href={r.href} className="group relative aspect-[3/4] w-[78%] shrink-0 snap-center overflow-hidden bg-black/10 sm:w-[46%]">
                  {r.urlImagem ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.urlImagem} alt={r.nome} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-black/15" />
                  {r.statusLabel && (
                    <span className="absolute right-[clamp(10px,1.4vw,20px)] top-[clamp(10px,1.4vw,20px)] whitespace-nowrap bg-black/60 px-[clamp(10px,1.1vw,16px)] py-[clamp(4px,0.5vw,8px)] text-[clamp(9px,0.8vw,12px)] font-semibold uppercase tracking-[0.12em] text-white">{r.statusLabel}</span>
                  )}
                  <h3 className="absolute bottom-6 left-6 right-6 text-[clamp(18px,1.7vw,28px)] font-bold leading-tight text-white">{r.nome}</h3>
                </Link>
              ))}
            </Carrossel>
            <div className="sm:text-right">
              <Heading>Outros Destaques</Heading>
              <Link href="/" className="mt-3 inline-block text-[11px] font-semibold uppercase tracking-wide" style={{ color: tema.verLink }}>Ver empreendimentos →</Link>
            </div>
          </div>
        </section>
      )}

      {/* CONHEÇA MAIS SOBRE A BENX */}
      <section data-reveal className="bg-[#0A2A66]">
        <div className={`${COL} flex flex-col items-start justify-between gap-8 py-16 sm:flex-row sm:items-center`}>
          <div className="max-w-xl text-white">
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white/55">A Benx</p>
            <h2 className="mt-3 text-[30px] font-light leading-[1.1] tracking-tight sm:text-[40px]">Conheça mais sobre a Benx</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-white/70">
              Mais de cinco décadas transformando São Paulo, com projetos que unem arquitetura, localização e qualidade de vida.
            </p>
          </div>
          <Link
            href="/origem-proposito"
            className="group inline-flex shrink-0 items-center gap-3 border border-white/40 px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-white transition-colors duration-300 hover:bg-white hover:text-[#0A2A66]"
          >
            Conheça a Benx
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </section>

      <SiteFooter variant={marca === "vivabenx" ? "vivabenx" : "padrao"} />
    </div>
  );
}

function AppIcon({ href, src, label, bg, border }: { href: string; src: string; label: string; bg: string; border?: boolean }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="transition hover:-translate-y-0.5">
      <span className="grid h-[68px] w-[68px] place-items-center overflow-hidden" style={{ background: bg, border: border ? "1px solid #e0e0e0" : undefined }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={label} className="h-full w-full object-contain" />
      </span>
    </a>
  );
}

