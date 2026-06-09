"use client";

import { useState } from "react";

export interface MarcoTempo {
  ano: string;
  titulo: string;
  texto: string;
  imagem?: string;
}

const NAVY = "#0a2a66";

// Linha do tempo interativa (1976 → 2021) com abas por ano.
export function LinhaTempo({ marcos }: { marcos: MarcoTempo[] }) {
  const [ativo, setAtivo] = useState(0);
  const m = marcos[ativo];
  if (!m) return null;

  return (
    <div>
      {/* abas de anos */}
      <div className="relative">
        <div className="flex gap-7 overflow-x-auto border-b border-black/10 pb-px [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {marcos.map((x, i) => {
            const on = i === ativo;
            return (
              <button
                key={x.ano}
                type="button"
                onClick={() => setAtivo(i)}
                className="relative shrink-0 pb-4 text-[18px] font-semibold transition-colors sm:text-[22px]"
                style={{ color: on ? NAVY : "#c2c8d2" }}
              >
                {x.ano}
                {on && <span className="absolute inset-x-0 -bottom-px h-[2px]" style={{ background: NAVY }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* conteúdo do marco selecionado */}
      <div className="mt-10 grid items-start gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <h3 className="text-[24px] font-normal leading-snug sm:text-[30px]" style={{ color: NAVY }}>
            {m.titulo}
          </h3>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#5a6577]">{m.texto}</p>
        </div>
        <div className="aspect-[16/10] w-full overflow-hidden bg-[#e9edf3]">
          {m.imagem ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.imagem} alt={m.titulo} className="h-full w-full object-cover" />
          ) : null}
        </div>
      </div>
    </div>
  );
}
