import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { Reveal } from "@/components/public/reveal";

export const metadata: Metadata = {
  title: "Vendas",
  description:
    "Nossa equipe de vendas está pronta para transformar o sonho da casa própria em realidade. Conheça os canais de vendas da Benx.",
};

const NAVY = "#0a2a66";
const COL = "mx-auto w-full max-w-site px-6";

const CANAIS: { label: string; href: string; externo?: boolean }[] = [
  { label: "Central de Vendas", href: "tel:08007291981" },
  { label: "Central de Vendas", href: "tel:08007291981" },
  { label: "Vendas via Chat Online", href: "#" },
  { label: "Vendas via WhatsApp", href: "https://wa.me/5511944431066?text=Ol%C3%A1%2C%20vi%20o%20Portal%20Benx%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es.", externo: true },
  { label: "Vendas via E-mail", href: "mailto:relacionamento@benx.com.br" },
];

export default function VendasPage() {
  return (
    <div className="bg-white text-[#1a2230]">
      {/* HERO */}
      <header className="relative flex h-[60vh] min-h-[420px] flex-col justify-end overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/vendas/hero.jpg" alt="Vendas" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/45" />

        <SiteHeader />

        <div className={`relative z-10 ${COL} pb-12`}>
          <h1 className="text-[40px] font-light leading-none tracking-tight text-white sm:text-[64px]">Vendas</h1>
        </div>
      </header>

      {/* BEM-VINDO */}
      <section className={`${COL} py-20`}>
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
            <div>
              <h2 className="text-[34px] font-light leading-[1.1] tracking-tight sm:text-[44px]" style={{ color: NAVY }}>
                Bem-vindo<br />ao seu novo lar
              </h2>
              <p className="mt-6 text-[22px] font-light leading-snug" style={{ color: NAVY }}>
                Nossa equipe de vendas está pronta para transformar o sonho da casa própria em realidade.
              </p>
            </div>
            <p className="text-[15px] leading-relaxed text-[#5a6577] lg:pt-4">
              Aqui você pode: conhecer nossos empreendimentos disponíveis; agendar visitas aos apartamentos decorados; simular financiamento e condições de pagamento; tirar dúvidas com nossos consultores especializados; receber propostas personalizadas para seu perfil.
            </p>
          </div>

          {/* CARD navy de canais */}
          <div className="mt-12 grid gap-10 bg-[#0a2a66] p-10 lg:grid-cols-2 lg:items-center lg:p-12">
            <div className="text-white">
              <p className="text-[22px] font-light leading-snug">
                Acesse os nossos canais de vendas para ter acesso a informações e novidades
              </p>
              <p className="mt-6 text-[16px] font-light leading-relaxed text-white/90">
                Clique aqui e fale com o nosso Chat Online ou ligue para: <strong className="font-semibold">0800 729 1981</strong>
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {CANAIS.map((c, i) => (
                <a
                  key={i}
                  href={c.href}
                  target={c.externo ? "_blank" : undefined}
                  rel={c.externo ? "noopener noreferrer" : undefined}
                  className="group flex items-center gap-3 border border-white/30 px-5 py-3.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-white/10"
                >
                  <ArrowRight size={16} className="shrink-0 transition-transform group-hover:translate-x-1" />
                  {c.label}
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
