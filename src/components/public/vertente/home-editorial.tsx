import Link from "next/link";
import { Reveal } from "@/components/public/reveal";

const COL = "mx-auto w-full max-w-site px-6";
const NAVY = "#0A2A66";
const VERMELHO = "#e11d2a";

// Arquitetos em destaque (mesmas fotos da página /mentes-criativas).
const ARQUITETOS = [
  { nome: "Jacobsen Arquitetura", foto: "/mentes/arq-1.jpg" },
  { nome: "Lissoni & Partners", foto: "/mentes/arq-2.jpg" },
  { nome: "Gensler + Zien", foto: "/mentes/arq-3.jpg" },
  { nome: "Triptyque Architecture", foto: "/mentes/arq-4.jpg" },
  { nome: "Enea Landscape", foto: "/mentes/arq-5.jpg" },
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-[32px] font-light leading-[1.02] tracking-tight sm:text-[44px] lg:text-[50px]" style={{ color: NAVY }}>
              Arquitetos que inspiram
            </h2>
            <p className="max-w-xs text-[15px] leading-relaxed text-black/55 sm:text-right">
              Mentes que assinam cada empreendimento Benx.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {ARQUITETOS.map((a) => (
              <Link key={a.nome} href="/mentes-criativas" className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.foto}
                    alt={a.nome}
                    loading="lazy"
                    className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-[1.05]"
                  />
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
                <p className="mt-3 text-[13px] font-medium leading-tight tracking-tight text-[#1a2230] transition-colors group-hover:text-[#0A2A66] sm:text-[14px]">
                  {a.nome}
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-10 flex justify-center sm:justify-end">
            <Link
              href="/mentes-criativas"
              className="inline-block px-8 py-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-white transition duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg"
              style={{ background: VERMELHO }}
            >
              Conheça os arquitetos
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
