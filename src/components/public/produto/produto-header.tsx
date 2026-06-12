"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BuscaTrigger } from "@/components/public/busca-glass";
import { MenuTrigger } from "@/components/public/menu-overlay";

const GLASS = {
  background: "rgba(18,20,24,0.72)",
  backdropFilter: "blur(18px) saturate(140%)",
  WebkitBackdropFilter: "blur(18px) saturate(140%)",
} as const;

// Header fixo da página de produto. No topo (sobre o hero) fica transparente, só
// logo + busca/menu. Ao rolar para além do hero, vira sólido e os itens de seção
// (O Projeto, Galeria, ...) "dockam" no meio do header, como o menu da página.
export function ProdutoHeader({
  marca,
  homeHref,
  navItens,
}: {
  marca: "benx" | "vivabenx";
  homeHref: string;
  navItens: { id: string; label: string }[];
}) {
  const [scrolled, setScrolled] = useState(false);
  const [ativo, setAtivo] = useState(navItens[0]?.id ?? "");

  // Mesmo threshold do AnchorNav (50% da viewport) para sincronizar a troca.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.5);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Seção visível (destaque do item ativo).
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => { for (const e of entries) if (e.isIntersecting) setAtivo(e.target.id); },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    for (const it of navItens) { const el = document.getElementById(it.id); if (el) obs.observe(el); }
    return () => obs.disconnect();
  }, [navItens]);

  return (
    <div
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300 ${
        scrolled ? "border-b border-white/10" : "border-b border-transparent bg-gradient-to-b from-black/90 via-black/55 to-transparent"
      }`}
      style={scrolled ? GLASS : undefined}
    >
      <div className="mx-auto flex max-w-site items-center gap-4 px-6 py-4">
        <Link href={homeHref} aria-label={marca === "vivabenx" ? "Viva Benx" : "Benx"} className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {marca === "vivabenx" ? (
            <img src="/logo-vivabenx-cor.svg" alt="Viva Benx" className="h-10 w-auto" />
          ) : (
            <img src="/logo-benx.svg" alt="Benx" className="h-9 w-auto" />
          )}
        </Link>

        {/* Itens de seção: dockam no header ao rolar (desktop). */}
        <nav
          aria-hidden={!scrolled}
          className={`hidden min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto px-2 transition-opacity duration-300 lg:flex [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            scrolled ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          {navItens.map((it) => (
            <a
              key={it.id}
              href={`#${it.id}`}
              className="whitespace-nowrap px-3 py-1.5 text-[13px] font-semibold uppercase tracking-[0.05em] transition-colors hover:text-white"
              style={{ color: ativo === it.id ? "#ffffff" : "rgba(255,255,255,0.62)" }}
            >
              {it.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-3 text-white">
          <BuscaTrigger className="h-11 w-11 hover:opacity-80" />
          <MenuTrigger className="h-11 w-11 hover:opacity-80" />
        </div>
      </div>
    </div>
  );
}
