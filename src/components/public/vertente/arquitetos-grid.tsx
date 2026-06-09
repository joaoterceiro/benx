"use client";

import { useState } from "react";

// Imagens reais dos arquitetos (do elemento do WordPress). A última é a "larga".
const IMAGENS = [
  "/home/arquiteto-1.png",
  "/home/arquiteto-2.png",
  "/home/arquiteto-3.png",
  "/home/arquiteto-4.png",
  "/home/arquiteto-5.png",
];

// Acordeão horizontal: a coluna com hover expande, as demais encolhem.
// Por padrão a última é a "larga". Convertido do elemento do WordPress.
export function ArquitetosGrid() {
  const [hover, setHover] = useState<number | null>(null);

  function flex(i: number): string {
    if (hover === null) return i === IMAGENS.length - 1 ? "1 1 0%" : "0 0 90px";
    return i === hover ? "1.8 0 0%" : "0 0 60px";
  }

  return (
    <div className="flex h-[300px] w-full min-w-0 gap-1 overflow-hidden sm:h-[380px]">
      {IMAGENS.map((src, i) => (
        <div
          key={i}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
          className="group relative cursor-pointer overflow-hidden"
          style={{ flex: flex(i), transition: "flex .5s cubic-bezier(.4,0,.2,1)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={`Arquiteto ${i + 1}`} loading="lazy" className="h-full w-full object-cover object-[center_top]" />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      ))}
    </div>
  );
}
