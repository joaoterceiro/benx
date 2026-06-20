import type { Metadata } from "next";
import { EsgShell, COL, NAVY } from "@/components/public/esg/esg-shell";
import { Reveal } from "@/components/public/reveal";

export const metadata: Metadata = {
  title: "Gente e Gestão de Stakeholders — ESG",
  description: "Valorização das pessoas, diversidade e inclusão, saúde e segurança certificada (ISO 45001) e relacionamento com stakeholders.",
};

const CARDS = [
  { t: "Cuidando de pessoas", d: "Foco em benefícios, qualificação, desenvolvimento e compromisso com a diversidade." },
  { t: "Cliente no centro", d: "Buscamos a melhoria contínua e uma jornada integrada." },
  { t: "Saúde e segurança certificada", d: "Garantimos um ambiente seguro com nosso sistema certificado ISO 45001." },
  { t: "Relacionamentos sólidos", d: "Fortalecemos parcerias com fornecedores e corretores através da ética e do diálogo." },
];

export default function EsgGentePage() {
  return (
    <EsgShell ativo="gente">
      <section className={`${COL} py-16`}>
        <Reveal>
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div>
              <span className="inline-block border border-[#e3e8ef] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5b6577]">Gente e gestão de stakeholders</span>
              <div className="mt-6 space-y-5 text-[15px] leading-relaxed text-[#5a6577]">
                <p>A Benx reconhece que a valorização das pessoas e a gestão de stakeholders são essenciais para a geração de valor sustentável. Com práticas consolidadas, metas definidas e um ambiente ético, inclusivo e colaborativo, a empresa promove comunicação transparente, desenvolvimento contínuo de talentos e rigor em saúde e segurança ocupacional.</p>
                <p>A diversidade e a inclusão permeiam toda a jornada profissional, enquanto o relacionamento com colaboradores, clientes, fornecedores, corretores e investidores é guiado por diálogo constante e responsabilidade, sempre alinhado ao compromisso da companhia com a transformação urbana, a requalificação de áreas e a valorização do espaço público, contribuindo para melhorias que impactam positivamente a vida na cidade.</p>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/esg/gente-pessoas.webp" alt="Gente e gestão de stakeholders" className="aspect-[4/3] w-full rounded-sm object-cover" />
          </div>
        </Reveal>
      </section>

      <section className="bg-[#f6f7f9]">
        <Reveal className={`${COL} py-16`}>
          <div className="grid gap-6 sm:grid-cols-2">
            {CARDS.map((c) => (
              <div key={c.t} className="bg-white p-8 shadow-xs">
                <h3 className="text-[18px] font-semibold" style={{ color: NAVY }}>{c.t}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[#5a6577]">{c.d}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>
    </EsgShell>
  );
}
