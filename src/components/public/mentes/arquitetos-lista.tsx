"use client";

import { useEffect, useState } from "react";

const NAVY = "#0a2a66";

export interface Arquiteto {
  nome: string;
  descricao: string;
  projeto: string;
  foto: string;
}

const umaLinha = (s: string) => s.replace(/\n/g, " ");

// Showcase de arquitetos em abas: nomes no topo (ativa em navy com underline);
// abaixo, foto à esquerda e nome/descrição/empreendimento à direita.
// Avança sozinho (autoplay) em loop, pausando ao passar o mouse.
export function ArquitetosLista({ arquitetos, intervalMs = 7000 }: { arquitetos: Arquiteto[]; intervalMs?: number }) {
  const [ativo, setAtivo] = useState(0);
  const [pausado, setPausado] = useState(false);

  useEffect(() => {
    if (pausado || arquitetos.length <= 1) return;
    const id = setInterval(() => setAtivo((i) => (i + 1) % arquitetos.length), intervalMs);
    return () => clearInterval(id);
  }, [pausado, arquitetos.length, intervalMs]);

  const a = arquitetos[ativo];
  if (!a) return null;

  return (
    <div onMouseEnter={() => setPausado(true)} onMouseLeave={() => setPausado(false)}>
      {/* Abas com os nomes */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-2 border-b border-black/10 sm:gap-x-12">
        {arquitetos.map((arq, i) => {
          const on = i === ativo;
          return (
            <button
              key={arq.nome}
              type="button"
              onClick={() => setAtivo(i)}
              aria-pressed={on}
              className={`relative -mb-px whitespace-nowrap pb-4 text-[15px] font-medium tracking-tight transition-colors sm:text-[17px] ${on ? "" : "text-[#aab2c0] hover:text-[#5a6577]"}`}
              style={on ? { color: NAVY } : undefined}
            >
              {umaLinha(arq.nome)}
              {on && (
                <>
                  <span className="absolute inset-x-0 -bottom-px h-[2px]" style={{ background: "rgba(10,42,102,0.15)" }} />
                  <span
                    key={ativo}
                    className="absolute left-0 -bottom-px h-[2px]"
                    style={{
                      background: NAVY,
                      animation: `arq-progress ${intervalMs}ms linear forwards`,
                      animationPlayState: pausado ? "paused" : "running",
                    }}
                  />
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Conteúdo: foto à esquerda, texto à direita */}
      <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="overflow-hidden bg-[#e9edf3]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={a.foto} alt={umaLinha(a.nome)} className="aspect-[4/3] w-full object-cover object-top" />
        </div>
        <div className="lg:pt-2">
          <h3 className="text-[34px] font-bold leading-[1.04] tracking-tight sm:text-[46px]" style={{ color: NAVY }}>
            {umaLinha(a.nome)}
          </h3>
          <p className="mt-6 whitespace-pre-line text-[15px] leading-relaxed text-[#5a6577]">{a.descricao}</p>
          {a.projeto && <p className="mt-3 text-[15px] leading-relaxed text-[#5a6577]">{a.projeto}</p>}
        </div>
      </div>
    </div>
  );
}
