import type { Metadata } from "next";
import { Handshake, Target, Users, Plus } from "lucide-react";
import { EsgShell, COL, NAVY } from "@/components/public/esg/esg-shell";
import { Reveal } from "@/components/public/reveal";

export const metadata: Metadata = {
  title: "A Benx — ESG",
  description: "Quem é a Benx: 50 anos de história, propósito e direcionadores estratégicos.",
};

const LINHA = [
  { ano: "1975", texto: "Fundação da Bueno Netto." },
  { ano: "2012", texto: "A Bueno Netto se divide em Benx Incorporadora, BN Engenharia e BEM Imobiliária." },
  { ano: "2024", texto: "Bueno Netto completa 50 anos. Benx incorpora equipes da engenharia, em reestruturação estratégica. Fundação do Instituto Bueno Netto." },
];

const VALORES = [
  { t: "Senso de Dono", d: "Responsabilidade e compromisso em cada decisão.", icon: Handshake },
  { t: "Foco no Cliente", d: "Cliente no centro das decisões e dos resultados.", icon: Target },
  { t: "Gente", d: "Ambiente colaborativo, diverso e orientado ao desenvolvimento.", icon: Users },
];

export default function EsgABenxPage() {
  return (
    <EsgShell ativo="benx">
      <section className={`${COL} py-16`}>
        <Reveal>
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
            <div>
              <span className="inline-block border border-[#e3e8ef] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5b6577]">A Benx</span>
              <h2 className="mt-6 text-[34px] font-light tracking-tight sm:text-[46px]" style={{ color: NAVY }}>Quem somos</h2>
              <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-[#5a6577]">
                <p>A Benx é uma empresa brasileira com sede na cidade de São Paulo, atuando nos setores de incorporação imobiliária e construção civil. Desde 2012, funcionava como unidade de negócios da Bueno Netto, com foco exclusivo na incorporação. Em 2024, passou por reestruturação estratégica que marcou a nova fase de expansão: absorveu as equipes de construção civil integrando em seu escopo operação própria de obras, fortalecendo agilidade, eficiência e controle dos processos.</p>
                <p>Com a verticalização, ampliamos nossa competitividade, internalizando planejamento, projetos e suprimentos. Hoje conduzimos todo o ciclo do empreendimento, do desenvolvimento do produto à entrega e assistência técnica.</p>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/origem/Group-1000005967.png" alt="Empreendimento Benx" className="aspect-[3/4] w-full rounded-sm object-cover" />
          </div>
        </Reveal>
      </section>

      {/* Linha do tempo */}
      <section className={`${COL} pb-16`}>
        <Reveal>
          <div className="grid gap-8 sm:grid-cols-3">
            {LINHA.map((l) => (
              <div key={l.ano}>
                <span className="inline-block bg-[#0a2a66] px-5 py-2 text-[14px] font-semibold text-white">{l.ano}</span>
                <p className="mt-4 text-[14px] italic leading-relaxed text-[#5a6577]">{l.texto}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Direcionadores + propósito */}
      <section className="bg-[#f6f7f9]">
        <Reveal className={`${COL} py-16`}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5b6577]">Nossos direcionadores estratégicos</p>
          <div className="mt-6 bg-[#0a2a66] p-8 sm:p-12">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/70">Nosso propósito</p>
            <p className="mt-4 max-w-3xl text-[22px] font-light leading-snug text-white sm:text-[28px]">
              “Transformar a vida das pessoas por meio de empreendimentos imobiliários que combinam inovação e cuidado humano.”
            </p>
          </div>
          <p className="mt-12 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5b6577]">Nossos valores</p>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {VALORES.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.t} className="grid place-items-center bg-[#7f8389] px-6 py-8 text-center text-white">
                  <Icon size={30} strokeWidth={1.6} />
                  <h3 className="mt-4 text-[18px] font-semibold">{v.t}</h3>
                  <p className="mt-2 text-[13px] leading-snug text-white/90">{v.d}</p>
                </div>
              );
            })}
          </div>
        </Reveal>
      </section>

      {/* Modelo de negócio: plataforma integrada */}
      <section className="bg-[#d8dadd]">
        <Reveal className={`${COL} py-16 text-center`}>
          <p className="text-[13px] font-semibold text-[#3a3f47]">Nosso Novo Modelo de Negócio:</p>
          <h2 className="mt-2 text-[34px] font-light leading-[1.05] tracking-tight sm:text-[48px]" style={{ color: NAVY }}>
            Uma plataforma<br />integrada de valor
          </h2>
          <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-4 sm:flex-row sm:items-stretch">
            <div className="flex-1 bg-[#0a2a66] p-8 text-left text-white">
              <h3 className="text-[20px] font-semibold">Incorporação (Benx)</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-white/85">Domínio das expectativas dos clientes e tendências de mercado.</p>
            </div>
            <div className="grid shrink-0 place-items-center text-[#0a2a66] sm:px-1"><Plus size={32} strokeWidth={2.4} /></div>
            <div className="flex-1 bg-white p-8 text-left">
              <h3 className="text-[20px] font-semibold" style={{ color: NAVY }}>Construção (BN Engenharia)</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-[#5a6577]">Expertise em tecnologias, inovações construtivas e gestão de obras.</p>
            </div>
          </div>
        </Reveal>
      </section>
    </EsgShell>
  );
}
