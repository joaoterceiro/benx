"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const NAVY = "#0a2a66";

// Carrossel de logos de prêmios/certificações: quadrado cinza, setas laterais e bolinhas.
export function PremiosCarrossel({ logos }: { logos: { src: string; alt: string }[] }) {
  const [i, setI] = useState(0);
  if (logos.length === 0) return null;

  const ir = (d: number) => setI((p) => (p + d + logos.length) % logos.length);

  return (
    <div>
      <div className="relative">
        <div className="grid aspect-square w-full place-items-center bg-[#efefef] p-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logos[i].src} alt={logos[i].alt} className="max-h-full max-w-full object-contain" />
        </div>
        {logos.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Anterior"
              onClick={() => ir(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-[#c97b6e] transition hover:text-[#0a2a66]"
            >
              <ChevronLeft size={28} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              aria-label="Próximo"
              onClick={() => ir(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#c97b6e] transition hover:text-[#0a2a66]"
            >
              <ChevronRight size={28} strokeWidth={1.5} />
            </button>
          </>
        )}
      </div>

      {logos.length > 1 && (
        <div className="mt-6 flex justify-center gap-2.5">
          {logos.map((l, idx) => (
            <button
              key={l.src}
              type="button"
              aria-label={`Ver ${l.alt}`}
              onClick={() => setI(idx)}
              className="h-2.5 w-2.5 rounded-full transition"
              style={{ background: idx === i ? NAVY : "#cbd2dd" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
