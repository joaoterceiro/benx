import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { Reveal } from "@/components/public/reveal";

export const metadata: Metadata = {
  title: "Atendimento",
  description:
    "Aqui você encontra os canais de atendimento da Benx. Escolha a forma que lhe for mais conveniente para falar conosco.",
};

const NAVY = "#0a2a66";
const COL = "mx-auto w-full max-w-site px-6";

const CANAIS: { label: string; href: string }[] = [
  { label: "Vendas", href: "/vendas" },
  { label: "Portal do Cliente", href: "/portal-do-cliente" },
  { label: "Canal de Ética", href: "/canal-de-etica" },
  { label: "Trabalhe Conosco", href: "/trabalhe-conosco" },
  { label: "Assessoria de Imprensa", href: "/assessoria-de-imprensa" },
  { label: "Venda seu Terreno", href: "/venda-seu-terreno" },
  { label: "Sou Vizinho", href: "/sou-vizinho" },
  { label: "Corretores e Imobiliárias", href: "/corretores-e-imobiliarias" },
];

export default function AtendimentoPage() {
  return (
    <div className="bg-white text-[#1a2230]">
      {/* HERO */}
      <header className="relative flex h-[60vh] min-h-[420px] flex-col justify-end overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/atendimento/hero.jpg" alt="Atendimento" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/40" />

        <SiteHeader />

        <div className={`relative z-10 ${COL} pb-12`}>
          <h1 className="text-[40px] font-light leading-none tracking-tight text-white sm:text-[64px]">Atendimento</h1>
        </div>
      </header>

      {/* CANAIS */}
      <section className={`${COL} py-20`}>
        <Reveal>
          <h2 className="max-w-3xl text-[28px] font-light leading-[1.25] tracking-tight sm:text-[36px]" style={{ color: NAVY }}>
            Aqui você encontra os <span className="font-semibold">canais de atendimento</span> da Benx. Escolha a forma que lhe for mais conveniente para falar conosco
          </h2>

          <div className="mt-12 flex flex-col">
            {CANAIS.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className="group flex items-center justify-between border-b border-black/10 py-6 text-[20px] font-normal tracking-tight transition-colors sm:text-[22px]"
                style={{ color: NAVY }}
              >
                {c.label}
                <ArrowRight size={20} strokeWidth={1.6} className="transition-transform duration-300 group-hover:translate-x-1.5" />
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
