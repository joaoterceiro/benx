"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Reveal on-scroll FAIL-OPEN: o conteúdo já é visível; aqui só escondemos o que
// está abaixo da dobra (.reveal-hidden) e revelamos ao entrar na viewport. Assim,
// se o JS não rodar, nada fica invisível. Reaplica a cada navegação; respeita
// prefers-reduced-motion (não esconde nada).
export function ScrollReveal() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])"));
    if (els.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement;
            el.classList.remove("reveal-hidden");
            el.setAttribute("data-revealed", "");
            io.unobserve(el);
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
    );

    const limite = window.innerHeight * 0.9;
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.top > limite) {
        // abaixo da dobra: esconde e observa pra revelar ao rolar
        el.classList.add("reveal-hidden");
        io.observe(el);
      } else {
        // já visível no load: deixa como está (fica visível)
        el.setAttribute("data-revealed", "");
      }
    }
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
