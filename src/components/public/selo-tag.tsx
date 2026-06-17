"use client";

import { useState, type SyntheticEvent } from "react";
import { seloPosClasses, type SeloConfig } from "@/lib/selo";

// Overlay do selo de habitação na card. Por padrão fica REDUZIDO (para não
// colidir com a tag de status no topo); ao clicar, expande só o selo para o
// tamanho cheio configurado. O pai deve ser position:relative. Como costuma
// ficar dentro de um <Link>, o clique cancela a navegação do card.
export function SeloTag({ url, config }: { url: string; config: SeloConfig }) {
  const [expandido, setExpandido] = useState(false);

  // Reduzido para ~55% do tamanho configurado; expandido amplia bem (até 88% da
  // largura da card) para leitura confortável.
  const larguraReduzida = Math.max(18, Math.round(config.tamanho * 0.55));
  const larguraExpandida = Math.min(88, Math.round(config.tamanho * 1.9));
  const largura = expandido ? larguraExpandida : larguraReduzida;

  const alternar = (e: SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandido((v) => !v);
  };

  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={expandido ? "Recolher selo de habitação" : "Ampliar selo de habitação"}
      aria-expanded={expandido}
      onClick={alternar}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") alternar(e); }}
      className={`absolute ${expandido ? "z-40 cursor-zoom-out" : "z-20 cursor-zoom-in"} ${seloPosClasses(config.posicao)}`}
      style={{ width: `${largura}%`, margin: `${config.margem}px`, opacity: config.opacidade / 100, transition: "width .25s ease" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Selo Prefeitura de São Paulo — habitação"
        className={`block h-auto w-full ${expandido ? "shadow-[0_8px_28px_rgba(0,0,0,0.45)]" : ""}`}
      />
    </span>
  );
}
