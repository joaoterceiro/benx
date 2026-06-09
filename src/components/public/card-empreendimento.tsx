import Link from "next/link";
import { Badge } from "@/components/ui/badge";

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
}

export function CardEmpreendimento(p: CardProps) {
  return (
    <Link
      href={p.href}
      className="group relative block aspect-[3/4] overflow-hidden bg-neutral-800"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={p.urlImagem || "/placeholder-card.jpg"}
        alt={p.nome}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />

      {/* gradiente para legibilidade */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/25" />

      {/* selo de status: caixa com borda, no topo */}
      {p.statusLabel ? (
        <span className="absolute right-5 top-6 whitespace-nowrap border border-white/70 px-5 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
          {p.statusLabel}
        </span>
      ) : null}

      {/* título grande embaixo */}
      <div className="absolute inset-x-0 bottom-0 p-6">
        <h3 className="text-[26px] font-bold leading-tight tracking-tight text-white drop-shadow sm:text-[30px]">{p.nome}</h3>
        {p.cidade ? <p className="mt-1 text-[13px] text-white/75">{p.cidade}</p> : null}
      </div>
    </Link>
  );
}

export { Badge };
