import Link from "next/link";
import { ArquitetosGrid } from "@/components/public/vertente/arquitetos-grid";
import { Reveal } from "@/components/public/reveal";

const COL = "mx-auto w-full max-w-site px-6";
const NAVY = "#0A2A66";
const VERMELHO = "#e11d2a";

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

      {/* Arquitetos que inspiram */}
      <section className={`${COL} pb-24`}>
        <Reveal className="grid items-center gap-12 lg:grid-cols-[3fr_2fr]">
          <ArquitetosGrid />
          <div className="max-w-lg">
            <h2 className="text-[32px] font-light leading-tight tracking-tight sm:text-[44px] lg:text-[50px]" style={{ color: NAVY }}>Arquitetos que<br />inspiram.</h2>
            <p className="mt-6 text-[15px] leading-[1.9] text-black/70 sm:text-[16px]">
              Na Benx, cada empreendimento começa com uma escolha que vai além da técnica: a escolha de
              quem assina. Acreditamos que grandes projetos nascem de mentes inquietas, que pensam a
              cidade com sensibilidade, ousadia e responsabilidade.
            </p>
            <Link href="#" className="mt-7 inline-block px-7 py-2.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-white transition duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg" style={{ background: VERMELHO }}>
              Ler mais
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
