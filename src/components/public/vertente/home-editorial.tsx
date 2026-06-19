import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/public/reveal";

const COL = "mx-auto w-full max-w-site px-6";
const NAVY = "#0A2A66";
const VERMELHO = "#e11d2a";

// Arquitetos em destaque (mesmas fotos da página /mentes-criativas).
const ARQUITETOS = [
  { nome: "Jacobsen Arquitetura", categoria: "Arquitetura", local: "São Paulo, Brasil", bio: "Linhas horizontais, madeira e integração radical com a paisagem.", foto: "/mentes/arq-1.jpg" },
  { nome: "Lissoni & Partners", categoria: "Design de Interiores", local: "Milão, Itália", bio: "Minimalismo italiano em interiores e mobiliário, por Piero Lissoni.", foto: "/mentes/arq-2.jpg" },
  { nome: "Gensler + Zien", categoria: "Arquitetura", local: "Projetos globais", bio: "Arquitetura de escala global para projetos corporativos e residenciais.", foto: "/mentes/arq-3.jpg" },
  { nome: "Triptyque Architecture", categoria: "Arquitetura", local: "São Paulo / Paris", bio: "Arquitetura sustentável franco-brasileira, em diálogo com o trópico.", foto: "/mentes/arq-4.jpg" },
  { nome: "Enea Landscape", categoria: "Paisagismo", local: "Rapperswil, Suíça", bio: "Jardins esculturais e curadoria de árvores como obra viva.", foto: "/mentes/arq-5.jpg" },
];

// Seção institucional: Parque Global.
export function ParqueGlobalSecao() {
  return (
    <section className={`${COL} pb-20`}>
      <Reveal className="grid items-center gap-12 lg:grid-cols-2">
        <div className="max-w-lg">
          <h2 className="text-[32px] font-light leading-tight tracking-tight sm:text-[44px] lg:text-[50px]" style={{ color: NAVY }}>Parque Global</h2>
          <p className="mt-6 text-[15px] leading-[1.9] text-black/70 sm:text-[16px]">
            Assinado pelo Bueno Netto, que celebra 50 anos de excelência no mercado imobiliário, o
            Parque Global reúne ícones mundiais em arquitetura, saúde, hospitalidade e cultura em um só
            lugar. Parcerias com o Hospital Albert Einstein, o Vibra tailored by Emiliano e um centro
            cultural internacional transformam o projeto em referência de qualidade de vida e bem-estar
            na América Latina. Com um shopping a céu aberto integrado à natureza, o Parque Global é um
            convite a uma vida urbana fluida, eficiente e inspiradora.
          </p>
          <Link href="https://parqueglobal.com.br/" target="_blank" rel="noopener noreferrer" className="mt-7 inline-block px-7 py-2.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-white transition duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg" style={{ background: NAVY }}>
            saiba mais
          </Link>
        </div>
        <div className="overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/home/parque-global.png" alt="Parque Global" className="aspect-[4/3] w-full object-cover transition duration-700 hover:scale-[1.04]" />
        </div>
      </Reveal>
    </section>
  );
}

// Seção institucional: Arquitetos que inspiram (vitrine premium, CTA /mentes-criativas).
export function ArquitetosSecao() {
  return (
      <section className="bg-[#f7f8fa]">
        <Reveal className={`${COL} pt-20 pb-14`}>
          {/* cabeçalho editorial */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.22em]" style={{ color: VERMELHO }}>Arquitetura &amp; Design</p>
              <h2 className="mt-4 text-[clamp(34px,4.2vw,58px)] font-medium leading-[1.0] tracking-[-0.025em]" style={{ color: NAVY }}>
                Arquitetos que inspiram
              </h2>
            </div>
            <p className="max-w-[280px] text-[15px] leading-relaxed text-black/45 sm:text-right">
              As assinaturas por trás de cada empreendimento Benx.
            </p>
          </div>

          <div className="my-10 h-px w-full bg-black/[0.08] sm:my-11" />

          {/* retratos: P&B viram cor + bio sobe no hover */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-5 lg:gap-y-9">
            {ARQUITETOS.map((a) => (
              <Link key={a.nome} href="/mentes-criativas" className="group block transition-transform duration-[400ms] ease-out hover:-translate-y-1">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[2px] bg-[#16181c]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.foto}
                    alt={a.nome}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-[700ms] ease-[cubic-bezier(.2,0,.2,1)] group-hover:scale-[1.04]"
                  />
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0f1218]/85 via-[#0f1218]/15 to-transparent opacity-0 transition-opacity duration-[450ms] group-hover:opacity-100" />
                  <div className="pointer-events-none absolute inset-x-[18px] bottom-[18px] translate-y-3 opacity-0 transition-all duration-[450ms] ease-out group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="text-[12px] font-medium text-white/65">{a.local}</span>
                    <p className="mt-1.5 text-[14px] leading-[1.45] text-white">{a.bio}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="relative inline-block text-[17px] font-medium leading-none tracking-[-0.01em]" style={{ color: NAVY }}>
                    {a.nome}
                    <span className="absolute -bottom-1 left-0 h-0.5 w-0 transition-[width] duration-[350ms] ease-out group-hover:w-full" style={{ background: VERMELHO }} />
                  </span>
                  <p className="mt-2 text-[12px] uppercase tracking-[0.12em] text-black/40">{a.categoria}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* CTA refinado */}
          <div className="mt-12 flex justify-center sm:mt-[52px] sm:justify-end">
            <Link href="/mentes-criativas" className="group inline-flex items-center gap-4 text-[13px] font-bold uppercase tracking-[0.16em]" style={{ color: NAVY }}>
              Conheça os arquitetos
              <span className="grid h-11 w-11 place-items-center rounded-full border border-black/10 transition-colors duration-300 group-hover:border-[#0A2A66] group-hover:bg-[#0A2A66]">
                <ArrowRight size={17} className="text-[#0A2A66] transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-white" />
              </span>
            </Link>
          </div>
        </Reveal>
      </section>
  );
}
