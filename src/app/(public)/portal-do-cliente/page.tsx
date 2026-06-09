import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, LayoutGrid, Phone, Mail, Clock } from "lucide-react";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { Reveal } from "@/components/public/reveal";

export const metadata: Metadata = {
  title: "Portal do Cliente",
  description:
    "O Portal do Cliente é um canal de relacionamento exclusivo para atender suas necessidades com mais praticidade: 2ª via de boletos, evolução da obra e Central de Atendimento.",
};

const NAVY = "#0a2a66";
const COL = "mx-auto w-full max-w-site px-6";

const PORTAL_URL = "https://cliente.benx.com.br/Login";
const OBRA_URL = "https://portalcliente.benx.com.br/acesso";

export default function PortalDoClientePage() {
  return (
    <div className="bg-white text-[#1a2230]">
      {/* HERO */}
      <header className="relative flex h-[60vh] min-h-[420px] flex-col justify-end overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/portal/bg-portal.jpg" alt="Portal do Cliente" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/40" />

        <SiteHeader />

        <div className={`relative z-10 ${COL} pb-12`}>
          <h1 className="text-[40px] font-light leading-none tracking-tight text-white sm:text-[64px]">Portal do Cliente</h1>
        </div>
      </header>

      {/* BEM-VINDO */}
      <section className={`${COL} py-20`}>
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
            <div>
              <h2 className="text-[34px] font-light leading-[1.1] tracking-tight sm:text-[44px]" style={{ color: NAVY }}>
                Bem-vindo<br />ao Portal do Cliente
              </h2>
              <p className="mt-6 text-[22px] font-light leading-snug" style={{ color: NAVY }}>
                O Portal do Cliente é um canal de relacionamento exclusivo para atender as suas necessidades com mais praticidade.
              </p>
            </div>
            <p className="text-[15px] leading-relaxed text-[#5a6577] lg:pt-4">
              Aqui você pode ter acesso às informações financeiras online, emitir a 2ª via dos boletos bancários para pagamento de suas parcelas, acompanhar evolução da obra do seu imóvel e enviar mensagens para a Central de Atendimento.
            </p>
          </div>

          {/* CARDS */}
          <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:items-stretch">
            {/* card navy: canais */}
            <div className="flex flex-col justify-center gap-8 bg-[#0a2a66] p-10 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-[230px] text-[22px] font-light leading-snug text-white">
                Acesse os nossos canais para ter acesso a informações e novidades
              </p>
              <div className="flex flex-col gap-3">
                <a href={PORTAL_URL} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 border border-white/30 px-5 py-3.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-white/10">
                  <ArrowRight size={16} className="shrink-0 transition-transform group-hover:translate-x-1" />
                  Portal do Cliente
                </a>
                <a href={OBRA_URL} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 border border-white/30 px-5 py-3.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-white/10">
                  <ArrowRight size={16} className="shrink-0 transition-transform group-hover:translate-x-1" />
                  Acompanhamento de obra
                </a>
              </div>
            </div>

            {/* card branco: central de atendimento */}
            <div className="border border-[#e3e8ef] bg-white p-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1AA0DF]">Central de Atendimento</p>
              <h3 className="mt-3 text-[26px] font-semibold tracking-tight" style={{ color: NAVY }}>Fale com a gente</h3>
              <p className="mt-1 text-[14px] text-[#5a6577]">Escolha o canal de sua preferência</p>

              <div className="mt-7 flex flex-col divide-y divide-[#eef1f5]">
                <a href={PORTAL_URL} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 py-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center border border-[#e3e8ef] text-[#0a2a66]"><LayoutGrid size={18} /></span>
                  <span>
                    <span className="block text-[11px] font-semibold uppercase tracking-wide text-[#8a94a6]">Portal do Cliente</span>
                    <span className="block text-[15px] font-semibold" style={{ color: NAVY }}>Acessar portal</span>
                  </span>
                </a>
                <a href="tel:40038503" className="group flex items-center gap-4 py-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center border border-[#e3e8ef] text-[#0a2a66]"><Phone size={18} /></span>
                  <span>
                    <span className="block text-[11px] font-semibold uppercase tracking-wide text-[#8a94a6]">Telefone</span>
                    <span className="block text-[15px] font-semibold" style={{ color: NAVY }}>4003-8503</span>
                  </span>
                </a>
                <a href="mailto:relacionamento@benx.com.br" className="group flex items-center gap-4 py-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center border border-[#e3e8ef] text-[#0a2a66]"><Mail size={18} /></span>
                  <span>
                    <span className="block text-[11px] font-semibold uppercase tracking-wide text-[#8a94a6]">E-mail</span>
                    <span className="block text-[15px] font-semibold" style={{ color: NAVY }}>relacionamento@benx.com.br</span>
                  </span>
                </a>
              </div>

              <p className="mt-5 flex items-center gap-2 text-[13px] text-[#5a6577]">
                <Clock size={15} className="text-[#8a94a6]" />
                Segunda a sexta, das <strong className="font-semibold">9h às 18h</strong>
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
