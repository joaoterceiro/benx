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
      { t: "Gerenciamento responsável de resíduos", d: "Focamos na redução, segregação na origem e destinação correta para reciclagem." },
      { t: "Compromisso climático", d: "Participação na Aliança GEE da Abrainc e inventários anuais de emissões de GEE." },
      { t: "Conformidade ambiental", d: "Sistemas de gestão certificado ISO 14001 e monitoramento rigoroso para mitigar os impactos ambientais e à comunidade." },
    ],
  },
];

export default function EsgConstrucaoPage() {
  return (
    <EsgShell ativo="sustentavel">
      <section className={`${COL} py-16`}>
        <Reveal>
          <span className="inline-block border border-[#e3e8ef] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5b6577]">Construção sustentável</span>
          <div className="mt-6 max-w-3xl text-[15px] leading-relaxed text-[#5a6577]">
            <p>Acreditamos que a construção civil tem um papel decisivo no desenvolvimento sustentável das cidades, e esse princípio orienta a nossa atuação desde a fundação. Trabalhamos para gerar benefícios urbanos reais, requalificando áreas degradadas, valorizando o espaço público e contribuindo para uma cidade mais conectada e funcional. Ao mesmo tempo, reconhecemos os impactos ambientais e sociais inerentes às obras e adotamos medidas eficazes para mitigá-los com responsabilidade.</p>
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
        </Reveal>
      </section>
    </EsgShell>
  );
}
