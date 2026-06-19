import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Phone, Mail, Clock } from "lucide-react";
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

const PORTAL_URL = "https://portalcliente.benx.com.br/acesso";

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
          {/* texto introdutório */}
          <p className="max-w-3xl text-[15px] leading-relaxed text-[#5a6577]">
            O Portal do Cliente é um canal de relacionamento exclusivo para atender as suas necessidades com mais praticidade. Aqui você pode ter acesso às informações financeiras online, emitir a 2ª via dos boletos bancários para pagamento de suas parcelas, acompanhar evolução da obra do seu imóvel e enviar mensagens para a Central de Atendimento.
          </p>

          {/* CANAIS — Fale com a gente + acesso ao portal, unificado */}
          <div className="mt-14 overflow-hidden rounded-2xl border border-[#e3e8ef] shadow-[0_1px_2px_rgba(0,0,0,0.04)] lg:grid lg:grid-cols-2">
            {/* navy: mensagem + CTA do portal */}
            <div className="flex flex-col justify-between gap-10 bg-[#0a2a66] p-10 sm:p-12">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6db3e8]">Central de Atendimento</p>
                <h3 className="mt-3 text-[30px] font-light leading-tight tracking-tight text-white sm:text-[36px]">Fale com a gente</h3>
                <p className="mt-4 max-w-sm text-[16px] font-light leading-relaxed text-white/75">
                  Acesse os nossos canais para informações financeiras, 2ª via de boletos, evolução da obra e novidades.
                </p>
              </div>
              <a
                href={PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex w-fit items-center gap-3 bg-white px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#0a2a66] transition duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                Acessar o Portal do Cliente
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </a>
            </div>

            {/* branco: demais canais */}
            <div className="bg-white p-10 sm:p-12">
              <p className="text-[14px] text-[#5a6577]">Escolha o canal de sua preferência</p>
              <div className="mt-5 flex flex-col divide-y divide-[#eef1f5]">
                <a href="tel:40038503" className="flex items-center gap-4 py-4 transition hover:opacity-80">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#f4f7fb] text-[#0a2a66]"><Phone size={18} /></span>
                  <span>
                    <span className="block text-[11px] font-semibold uppercase tracking-wide text-[#8a94a6]">Telefone</span>
                    <span className="block text-[16px] font-semibold" style={{ color: NAVY }}>4003-8503</span>
                  </span>
                </a>
                <a href="mailto:relacionamento@benx.com.br" className="flex items-center gap-4 py-4 transition hover:opacity-80">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#f4f7fb] text-[#0a2a66]"><Mail size={18} /></span>
                  <span>
                    <span className="block text-[11px] font-semibold uppercase tracking-wide text-[#8a94a6]">E-mail</span>
                    <span className="block break-all text-[16px] font-semibold" style={{ color: NAVY }}>relacionamento@benx.com.br</span>
                  </span>
                </a>
              </div>
              <p className="mt-6 flex items-center gap-2 text-[13px] text-[#5a6577]">
                <Clock size={15} className="text-[#8a94a6]" />
                Segunda a sexta, das <strong className="font-semibold text-[#1a2230]">9h às 18h</strong>
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
