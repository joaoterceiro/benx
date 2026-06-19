import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/public/reveal";

const COL = "mx-auto w-full max-w-site px-6";
const NAVY = "#0A2A66";
const VERMELHO = "#e11d2a";

// Arquitetos em destaque (mesmas fotos da página /mentes-criativas).
const ARQUITETOS = [
  { nome: "Jacobsen Arquitetura", papel: "Arquitetura", foto: "/mentes/arq-1.jpg" },
  { nome: "Lissoni & Partners", papel: "Design de Interiores", foto: "/mentes/arq-2.jpg" },
  { nome: "Gensler + Zien", papel: "Arquitetura", foto: "/mentes/arq-3.jpg" },
  { nome: "Triptyque Architecture", papel: "Arquitetura", foto: "/mentes/arq-4.jpg" },
  { nome: "Enea Landscape", papel: "Paisagismo", foto: "/mentes/arq-5.jpg" },
];

// Blocos institucionais da home (iguais em todas as vertentes): Parque Global
// e Arquitetos que inspiram.
export function HomeEditorial() {
  return (
    <>
      {/* Parque Global */}
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

      {/* Arquitetos que inspiram — teaser refinado, CTA para /mentes-criativas */}
      <section className={`${COL} pb-24`}>
        <Reveal>
          {/* cabeçalho editorial */}
          <div className="flex flex-col gap-4 border-b border-black/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: VERMELHO }}>Arquitetura & Design</p>
              <h2 className="mt-3 text-[34px] font-light leading-[1.0] tracking-tight sm:text-[46px] lg:text-[54px]" style={{ color: NAVY }}>
                Arquitetos que inspiram
              </h2>
            </div>
            <p className="max-w-xs text-[14px] leading-relaxed text-black/50 sm:text-right">
              As assinaturas por trás de cada empreendimento Benx.
            </p>
          </div>

          {/* retratos: P&B que ganham cor no hover */}
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-6">
            {ARQUITETOS.map((a, i) => (
              <Link key={a.nome} href="/mentes-criativas" className="group block">
                <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.foto}
                    alt={a.nome}
                    loading="lazy"
                    className="h-full w-full object-cover object-top grayscale transition-all duration-[800ms] ease-[cubic-bezier(.4,0,.2,1)] group-hover:scale-[1.05] group-hover:grayscale-0"
                  />
                  <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5" />
                </div>
                <div className="mt-4">
                  <p className="text-[11px] font-medium tabular-nums tracking-[0.1em] text-black/35">0{i + 1}</p>
                  <p className="mt-1 text-[14px] font-medium leading-snug tracking-tight text-[#1a2230]">{a.nome}</p>
                  <p className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-black/40">{a.papel}</p>
                  <span className="mt-2.5 block h-px w-0 transition-all duration-500 ease-out group-hover:w-8" style={{ background: NAVY }} />
                </div>
              </Link>
            ))}
          </div>

          {/* CTA refinado */}
          <div className="mt-12 flex justify-center sm:justify-end">
            <Link href="/mentes-criativas" className="group inline-flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.16em]" style={{ color: NAVY }}>
              Conheça os arquitetos
              <span className="grid h-9 w-9 place-items-center rounded-full border border-[#0A2A66]/25 transition-colors duration-300 group-hover:border-[#0A2A66] group-hover:bg-[#0A2A66]">
                <ArrowRight size={15} className="text-[#0A2A66] transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-white" />
              </span>
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
