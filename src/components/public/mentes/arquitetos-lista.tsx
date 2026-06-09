"use client";

import { useEffect, useRef, useState } from "react";

const NAVY = "#0a2a66";

export interface Arquiteto {
  nome: string;
  descricao: string;
  projeto: string;
  foto: string;
}

// Lista interativa de arquitetos: nomes à esquerda, detalhe + foto à direita.
// Avança sozinha em loop (tempo de leitura), pausando ao passar o mouse.
export function ArquitetosLista({ arquitetos, intervalMs = 7000 }: { arquitetos: Arquiteto[]; intervalMs?: number }) {
  const [ativo, setAtivo] = useState(0);
  const [pausado, setPausado] = useState(false);

  useEffect(() => {
    if (pausado || arquitetos.length <= 1) return;
    const id = setInterval(() => setAtivo((i) => (i + 1) % arquitetos.length), intervalMs);
    return () => clearInterval(id);
  }, [pausado, arquitetos.length, intervalMs]);

  const selecionar = (i: number) => setAtivo(i);

  const a = arquitetos[ativo];
  if (!a) return null;

  return (
    <div
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.6fr] lg:gap-16"
    >
      {/* lista de nomes */}
      <div className="flex flex-col">
        {arquitetos.map((arq, i) => {
          const on = i === ativo;
          return (
            <div key={arq.nome} className="relative border-b border-black/10">
              <button
                type="button"
                onClick={() => selecionar(i)}
                className="w-full py-5 text-left text-[20px] font-normal tracking-tight transition-colors sm:text-[24px]"
                style={{ color: on ? NAVY : "#aab2c0" }}
              >
                {arq.nome}
              </button>
              {/* progress bar do autoplay no item ativo */}
              {on && (
                <span
                  key={ativo}
                  className="absolute -bottom-px left-0 h-[2px]"
                  style={{
                    background: NAVY,
                    animation: `arq-progress ${intervalMs}ms linear forwards`,
                    animationPlayState: pausado ? "paused" : "running",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* detalhe */}
      <div className="grid gap-8 sm:grid-cols-[1.2fr_1fr] sm:items-start">
        <div>
          <h3 className="whitespace-pre-line text-[28px] font-normal leading-[1.1] tracking-tight sm:text-[34px]" style={{ color: NAVY }}>
            {a.nome}
          </h3>
          <p className="mt-5 whitespace-pre-line text-[14px] leading-relaxed text-[#5a6577]">{a.descricao}</p>
          {a.projeto && <p className="mt-5 text-[14px] leading-relaxed text-[#8a94a6]">{a.projeto}</p>}
        </div>
        <div className="overflow-hidden bg-[#e9edf3]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={a.foto} alt={a.nome} className="h-full w-full object-cover" />
        </div>
      </div>
    </div>
  );
}
