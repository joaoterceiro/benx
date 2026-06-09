import type { Metadata } from "next";
import { Users, ShieldCheck, FileText, Lock, MessageSquareWarning, BadgeCheck } from "lucide-react";
import { EsgShell, COL, NAVY } from "@/components/public/esg/esg-shell";
import { Reveal } from "@/components/public/reveal";

export const metadata: Metadata = {
  title: "Transparência e Prestação de Contas — ESG",
  description: "Governança da Benx: conselho consultivo, compliance e ética, relato de sustentabilidade, segurança digital, canal de denúncia e auditoria externa.",
};

const CARDS = [
  { icon: Users, t: "Conselho Consultivo", d: "Membros externos independentes garantindo governança de alto nível e decisões estratégicas robustas." },
  { icon: ShieldCheck, t: "Compliance & Ética", d: "Código de Ética atualizado, tolerância zero à corrupção e canal de denúncias independente." },
  { icon: FileText, t: "Relato de Sustentabilidade", d: "Transparência nos indicadores ESG, com compromissos, avanços e práticas que orientam nossa atuação responsável." },
  { icon: Lock, t: "Segurança Digital", d: "Investimentos em cibersegurança e conformidade com a LGPD para proteção de dados." },
  { icon: MessageSquareWarning, t: "Canal de Denúncia", d: "Acesse nosso canal de ética e compliance.", href: "/canal-de-etica" },
  { icon: BadgeCheck, t: "Auditoria Externa", d: "Demonstrações financeiras auditadas pela Ernst & Young, garantindo transparência." },
];

export default function EsgTransparenciaPage() {
  return (
    <EsgShell ativo="transparencia">
      <section className={`${COL} py-16`}>
        <Reveal>
          <span className="inline-block border border-[#e3e8ef] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5b6577]">Governança</span>
          <h2 className="mt-6 text-[34px] font-light tracking-tight sm:text-[46px]" style={{ color: NAVY }}>Transparência e prestação de contas</h2>
          <p className="mt-6 max-w-3xl text-[15px] leading-relaxed text-[#5a6577]">
            A estrutura de governança da Benx assegura processos decisórios robustos e relações de confiança com investidores, parceiros e colaboradores.
          </p>
        </Reveal>
      </section>

      {/* Conformidade 2024 */}
      <section className="bg-[#0a2a66]">
        <Reveal className={`${COL} flex flex-col items-center gap-2 py-14 text-center text-white`}>
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/70">Conformidade 2024</p>
          <p className="text-[72px] font-light leading-none sm:text-[96px]">Zero</p>
          <p className="text-[16px] text-white/85">Sanções legais ou casos de corrupção registrados</p>
          <p className="mt-3 text-[11px] tracking-wide text-white/45">GRI 3-3 | 2-15 | 2-23 | 2-24 | 2-26 | 2-27 | 205-1 | 205-2</p>
        </Reveal>
      </section>

      {/* Pilares de governança */}
      <section className={`${COL} py-16`}>
        <Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CARDS.map((c) => {
              const Icon = c.icon;
              const corpo = (
                <>
                  <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#0a2a66]/[0.07] text-[#0a2a66]"><Icon size={20} strokeWidth={1.8} /></span>
                  <h3 className="mt-4 text-[16px] font-semibold" style={{ color: NAVY }}>{c.t}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#5a6577]">{c.d}</p>
                </>
              );
              return c.href ? (
                <a key={c.t} href={c.href} className="block bg-[#f6f7f9] p-7 transition hover:bg-[#eef1f5]">{corpo}</a>
              ) : (
                <div key={c.t} className="bg-[#f6f7f9] p-7">{corpo}</div>
              );
            })}
          </div>
        </Reveal>
      </section>
    </EsgShell>
  );
}
