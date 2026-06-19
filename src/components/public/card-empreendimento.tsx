import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { SeloTag } from "@/components/public/selo-tag";
import { isSeloBottom, seloAlignSelf, type SeloConfig } from "@/lib/selo";

export interface CardProps {
  href: string;
  nome: string;
  subtitulo: string;
  cidade: string;
  statusLabel: string;
  vertenteLabel: string;
  vertenteCor: string;
  vertenteBg: string;
  urlImagem: string | null;
  seloUrl?: string | null;
  seloConfig?: SeloConfig;
}

export function CardEmpreendimento(p: CardProps) {
  return (
    <Link
      href={p.href}
      className="group relative block aspect-[3/4] overflow-hidden bg-neutral-800"
    >
      <Image
        src={p.urlImagem || "/placeholder-card.jpg"}
        alt={p.nome}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        loading="lazy"
        className="object-cover transition duration-500 group-hover:scale-105"
      />

      {/* selo no topo (posições superiores) */}
      {p.seloUrl && p.seloConfig && !isSeloBottom(p.seloConfig.posicao) && <SeloTag url={p.seloUrl} config={p.seloConfig} />}

      {/* gradiente para legibilidade */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/25" />

      {/* selo de status: caixa com borda, no topo */}
      {p.statusLabel ? (
        <span className="absolute right-[clamp(10px,1.4vw,20px)] top-[clamp(12px,1.6vw,24px)] whitespace-nowrap border border-white/70 px-[clamp(10px,1.1vw,16px)] py-[clamp(4px,0.5vw,7px)] text-[clamp(9px,0.8vw,11px)] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
          {p.statusLabel}
        </span>
      ) : null}

      {/* título embaixo; selo (posições inferiores) empilha ACIMA do título */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col p-6">
        {p.seloUrl && p.seloConfig && p.seloConfig.ativo && isSeloBottom(p.seloConfig.posicao) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.seloUrl} alt="Selo Prefeitura de São Paulo" className={`h-auto ${seloAlignSelf(p.seloConfig.posicao)}`} style={{ width: `${p.seloConfig.tamanho}%`, marginBottom: `${p.seloConfig.margem}px`, opacity: p.seloConfig.opacidade / 100 }} />
        )}
        <h3 className="text-[clamp(20px,1.9vw,30px)] font-bold leading-tight tracking-tight text-white drop-shadow">{p.nome}</h3>
        {p.cidade ? <p className="mt-1 text-[13px] text-white/75">{p.cidade}</p> : null}
      </div>
    </Link>
  );
}

export { Badge };
