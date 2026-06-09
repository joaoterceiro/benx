import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { Reveal } from "@/components/public/reveal";

export const metadata: Metadata = {
  title: "Corretores e Imobiliárias",
  description:
    "Seja um parceiro Benx. Aqui você encontra todas as informações necessárias para vender nossos produtos: tabela de preços, espelho de vendas, memoriais e muito mais.",
};

const NAVY = "#0a2a66";
const COL = "mx-auto w-full max-w-site px-6";

function Botao({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-3 border border-white/30 px-6 py-3.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-white/10"
    >
      <ArrowRight size={16} className="shrink-0 transition-transform group-hover:translate-x-1" />
      {label}
    </a>
  );
}

export default function CorretoresEImobiliariasPage() {
  return (
    <div className="bg-white text-[#1a2230]">
      {/* HERO */}
      <header className="relative flex h-[60vh] min-h-[420px] flex-col justify-end overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/canais/corretores.jpg" alt="Corretores e Imobiliárias" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/45" />

        <SiteHeader />

        <div className={`relative z-10 ${COL} pb-12`}>
          <h1 className="text-[36px] font-light leading-none tracking-tight text-white sm:text-[58px]">Corretores e Imobiliárias</h1>
        </div>
      </header>

      {/* BEM-VINDO + cards */}
      <section className={`${COL} py-20`}>
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
            <div>
              <h2 className="text-[34px] font-light leading-[1.1] tracking-tight sm:text-[44px]" style={{ color: NAVY }}>
                Seja um<br />parceiro Benx
              </h2>
              <p className="mt-6 text-[22px] font-light leading-snug" style={{ color: NAVY }}>
                Nós seguimos a legislação vigente e procuramos conhecer a rotina e hábitos dos bairros para minimizar qualquer transtorno aos vizinhos de nossas obras.
              </p>
            </div>
            <p className="text-[15px] leading-relaxed text-[#5a6577] lg:pt-4">
              Aqui você irá encontrar todas as informações necessárias para vender nossos produtos. São conteúdos exclusivos como tabela de preços, espelho de vendas, memoriais descritivos e muito mais! Tudo para potencializar o sucesso das suas vendas.
            </p>
          </div>

          {/* dois cards navy */}
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col bg-[#0a2a66] p-10">
              <h3 className="text-[18px] font-bold uppercase tracking-wide text-white">Venha para Benx</h3>
              <p className="mt-4 flex-1 text-[15px] font-light leading-relaxed text-white/90">
                Caso queira tornar-se um corretor Benx, inscreva-se e venha fazer parte do nosso time.
              </p>
              <div className="mt-6">
                <Botao label="Vendas via e-mail" href="mailto:rh.bem@bemimobiliaria.com.br" />
              </div>
            </div>

            <div className="flex flex-col bg-[#0a2a66] p-10">
              <h3 className="text-[18px] font-bold uppercase tracking-wide text-white">Parceria</h3>
              <p className="mt-4 flex-1 text-[15px] font-light leading-relaxed text-white/90">
                Caso seja uma imobiliária ou consultor autônomo, cadastre-se e se torne nosso parceiro.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Botao label="Acessar" href="https://parcerias.benx.com.br/Login" />
                <Botao label="Cadastre-se" href="https://parcerias.benx.com.br/cadastro" />
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
