import type { Metadata } from "next";
import { EsgShell, COL, NAVY } from "@/components/public/esg/esg-shell";
import { Reveal } from "@/components/public/reveal";

export const metadata: Metadata = {
  title: "Excelência nos Empreendimentos — ESG",
  description: "Qualidade transversal, Sistema de Gestão Integrada (SGI) e certificações que reforçam o compromisso da Benx com a excelência.",
};

export default function EsgExcelenciaPage() {
  return (
    <EsgShell ativo="excelencia">
      <section className={`${COL} py-16`}>
        <Reveal>
          <span className="inline-block border border-[#e3e8ef] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5b6577]">Excelência nos empreendimentos</span>
          <div className="mt-6 max-w-3xl space-y-5 text-[15px] leading-relaxed text-[#5a6577]">
            <p>A Benx atua em toda a cadeia imobiliária, da escolha estratégica do terreno à entrega dos produtos, desenvolvendo empreendimentos residenciais e comerciais com padrão de excelência em cada etapa.</p>
            <p><strong className="text-[#1a2230]">QUALIDADE</strong> é um valor transversal inegociável na Benx. Está presente desde o desenvolvimento do projeto até o pós-entrega, sempre com foco na experiência do cliente e na durabilidade dos empreendimentos.</p>
          </div>
        </Reveal>
      </section>

      <section className="bg-[#0a2a66]">
        <Reveal className={`${COL} py-14`}>
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/70">Política do SGI</p>
          <p className="mt-4 max-w-3xl text-[20px] font-light leading-snug text-white sm:text-[24px]">
            Transformar a vida das pessoas por meio de empreendimentos imobiliários com qualidade, construídos dentro do custo e prazo previstos, atendendo aos requisitos aplicáveis e buscando a melhoria contínua do Sistema de Gestão Integrada.
          </p>
        </Reveal>
      </section>

      <section className={`${COL} py-16`}>
        <Reveal>
          <h2 className="text-[24px] font-light tracking-tight sm:text-[30px]" style={{ color: NAVY }}>Certificações que reforçam o compromisso com a excelência</h2>
          <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-6">
            {["aqua.png", "Fitwel.png", "edge-1-1dd.png", "imagesd.png"].map((f) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={f} src={`/esg/${f}`} alt="Certificação" className="h-14 w-auto object-contain" />
            ))}
          </div>
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <div className="rounded-sm bg-[#f6f7f9] p-8">
              <h3 className="text-[18px] font-semibold" style={{ color: NAVY }}>Parque Global: referência nacional em certificações</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-[#5a6577]">O Parque Global é referência nacional em sustentabilidade, com 15 certificações concluídas ou em andamento, incluindo o LEED for Cities and Communities, atestando o compromisso com práticas ambientais, sociais e de governança de alto padrão.</p>
            </div>
            <div className="rounded-sm bg-[#f6f7f9] p-8">
              <h3 className="text-[18px] font-semibold" style={{ color: NAVY }}>Alto desempenho na habitação popular</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-[#5a6577]">A Viva Benx rompe a ideia de que habitação econômica não pode ser sustentável, ao unir acessibilidade financeira, qualidade arquitetônica e desempenho construtivo.</p>
              <p className="mt-3 text-[14px] leading-relaxed text-[#5a6577]">Com a metodologia ECONOMIX, integra soluções de eficiência construtiva e operacional, levando alto desempenho também à moradia popular.</p>
            </div>
          </div>
        </Reveal>
      </section>
    </EsgShell>
  );
}
