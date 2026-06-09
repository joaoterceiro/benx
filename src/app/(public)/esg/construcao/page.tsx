import type { Metadata } from "next";
import { EsgShell, COL, NAVY } from "@/components/public/esg/esg-shell";
import { Reveal } from "@/components/public/reveal";

export const metadata: Metadata = {
  title: "Construção Sustentável — ESG",
  description: "Planejamento e construção inteligente, gestão de recursos naturais e redução de impactos ao longo do ciclo de vida dos empreendimentos.",
};

const GRUPOS = [
  {
    titulo: "Planejamento e construção inteligente",
    itens: [
      { t: "Integração de critérios ambientais", d: "Desde a escolha do terreno até o projeto final." },
      { t: "Construção eficiente", d: "Metodologia Lean Construction para aprimorar a eficiência produtiva, reduzir retrabalho e desperdícios." },
      { t: "Resiliência climática", d: "Análise de exposição a riscos climáticos e incorporação de estratégias de adaptação." },
    ],
  },
  {
    titulo: "Gestão de recursos naturais",
    itens: [
      { t: "Uso consciente da água", d: "Sistemas para reuso e redução do consumo." },
      { t: "Eficiência e fontes renováveis de energia", d: "Utilizamos tecnologias de baixo consumo energético." },
      { t: "Valorização da biodiversidade", d: "Uso de espécies nativas nos paisagismos, reforçando o compromisso com nossos ecossistemas." },
    ],
  },
  {
    titulo: "Ciclo de vida e redução de impactos",
    itens: [
      { t: "Gerenciamento responsável de resíduos", d: "Destinação correta e redução dos resíduos gerados na construção." },
    ],
  },
];

export default function EsgConstrucaoPage() {
  return (
    <EsgShell ativo="sustentavel">
      <section className={`${COL} py-16`}>
        <Reveal>
          <span className="inline-block border border-[#e3e8ef] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5b6577]">Construção sustentável</span>
          <div className="mt-6 max-w-3xl space-y-4 text-[15px] leading-relaxed text-[#5a6577]">
            <p>Acreditamos que a construção civil tem um papel decisivo no desenvolvimento sustentável das cidades, e esse princípio orienta a nossa atuação desde a fundação.</p>
            <p>Cada empreendimento é concebido como parte do tecido urbano, integrando responsabilidade ambiental, social e econômica em todo o ciclo, da concepção à entrega.</p>
          </div>

          <div className="mt-12 flex flex-col gap-12">
            {GRUPOS.map((g) => (
              <div key={g.titulo}>
                <h2 className="text-[22px] font-light tracking-tight sm:text-[28px]" style={{ color: NAVY }}>{g.titulo}</h2>
                <div className="mt-6 grid gap-6 sm:grid-cols-3">
                  {g.itens.map((i) => (
                    <div key={i.t} className="border-t-2 border-[#0a2a66] pt-4">
                      <h3 className="text-[16px] font-semibold" style={{ color: NAVY }}>{i.t}</h3>
                      <p className="mt-2 text-[14px] leading-relaxed text-[#5a6577]">{i.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex items-center gap-4 border-t border-black/10 pt-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/esg/iso-45001.png" alt="ISO 45001" className="h-16 w-auto object-contain" />
            <p className="text-[13px] leading-relaxed text-[#5a6577]">Processos de obra com gestão de saúde e segurança certificada pela norma <strong className="text-[#1a2230]">ISO 45001</strong>.</p>
          </div>
        </Reveal>
      </section>
    </EsgShell>
  );
}
