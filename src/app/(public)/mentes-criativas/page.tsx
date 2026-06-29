import type { Metadata } from "next";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { Reveal } from "@/components/public/reveal";
import { Carrossel } from "@/components/public/produto/interativos";
import { ArquitetosLista } from "@/components/public/mentes/arquitetos-lista";
import { lerArquitetosResolvidos } from "@/lib/mentes";

export const metadata: Metadata = {
  title: "Arquitetos que inspiram",
  description:
    "Arquitetos que inspiram. Conheça os arquitetos, designers e paisagistas por trás dos empreendimentos Benx: Jacobsen, Lissoni & Partners, Gensler, Triptyque e Enea.",
};

const NAVY = "#0a2a66";
const COL = "mx-auto w-full max-w-site px-6";

const PROJETOS = [1, 2, 3, 4, 5, 6].map((n) => `/mentes/proj-${n}.jpg`);

export default async function MentesCriativasPage() {
  const arquitetos = await lerArquitetosResolvidos();

  return (
    <div className="bg-white text-[#1a2230]">
      {/* HERO */}
      <header className="relative flex h-[62vh] min-h-[440px] flex-col justify-end overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/mentes/hero.jpg" alt="Arquitetos que inspiram" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/30" />

        <SiteHeader />

        <div className={`relative z-10 ${COL} pb-10 text-right`}>
          <h1 className="ml-auto text-[44px] font-light leading-[1.05] tracking-tight text-white sm:text-[68px]">
            Arquitetos<br />que inspiram
          </h1>
        </div>
      </header>

      {/* INSPIRAÇÃO */}
      <section className={COL}>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative z-20 lg:-mt-48">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mentes/inspiracao.jpg" alt="Inspiração na vanguarda" className="aspect-[3/4] w-full object-cover" />
          </div>
          <div className="pb-16 pt-10 lg:pt-16">
            <Reveal>
              <p className="text-[15px] leading-relaxed text-[#5a6577]">
                Na Benx, cada empreendimento começa com uma escolha que vai além da técnica: a escolha de quem assina. Acreditamos que grandes projetos nascem de mentes inquietas, que pensam a cidade com sensibilidade, ousadia e responsabilidade.
              </p>
              <h2 className="mt-10 text-[34px] font-light leading-[1.1] tracking-tight sm:text-[44px]" style={{ color: NAVY }}>
                Inspiração<br />na vanguarda
              </h2>
              <div className="mt-6 space-y-5 text-[15px] leading-relaxed text-[#5a6577]">
                <p>Por isso, reunimos arquitetos, designers e paisagistas que nos inspiram, profissionais que compartilham da nossa visão de futuro e transformam cada espaço em uma experiência única. São nomes que não apenas projetam, mas contam histórias através da forma, da luz, da função e do entorno.</p>
                <p>Essa curadoria cuidadosa reflete o nosso compromisso com a excelência, a originalidade e o impacto positivo. Para nós, construir é também emocionar, e quem assina conosco precisa acreditar no poder de inspirar através da arquitetura.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* PROJETOS COM ASSINATURA */}
      <section className={`${COL} py-12`}>
        <Reveal>
          <div className="grid items-center gap-6 sm:grid-cols-2">
            <h2 className="text-[34px] font-light leading-[1.05] tracking-tight sm:text-[46px]" style={{ color: NAVY }}>
              Projetos<br />com assinatura
            </h2>
            <p className="text-[20px] font-light leading-snug sm:text-[24px]" style={{ color: NAVY }}>
              <span className="font-semibold">Visão, autoria</span> e<br /><span className="font-semibold">propósito</span> em cada traço
            </p>
          </div>
          <div className="mt-10">
            <Carrossel autoplay intervalMs={3500}>
              {PROJETOS.map((src, i) => (
                <div key={i} className="aspect-[3/4] w-[72%] shrink-0 snap-start overflow-hidden sm:w-[31%]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Projeto ${i + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </Carrossel>
          </div>
        </Reveal>
      </section>

      {/* ARQUITETOS */}
      {arquitetos.length > 0 && (
        <section className={`${COL} py-12 pb-24`}>
          <Reveal>
            <ArquitetosLista arquitetos={arquitetos} />
          </Reveal>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}
