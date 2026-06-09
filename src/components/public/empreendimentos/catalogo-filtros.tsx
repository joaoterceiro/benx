"use client";

import { useRouter, useSearchParams } from "next/navigation";

export interface Opcao { value: string; label: string }

const STATUS_TABS: { label: string; value: string }[] = [
  { label: "Lançamento", value: "lancamento" },
  { label: "Breve Lançamento", value: "breve_lancamento" },
  { label: "Em Construção", value: "em_construcao" },
  { label: "Prontos", value: "pronto_para_morar" },
];

export function CatalogoFiltros({
  status, bairro, tipo, tipologia, bairroOpts, tipoOpts, tipologiaOpts,
}: {
  status?: string; bairro?: string; tipo?: string; tipologia?: string;
  bairroOpts: Opcao[]; tipoOpts: Opcao[]; tipologiaOpts: Opcao[];
}) {
  const router = useRouter();
  const sp = useSearchParams();

  function navegar(patch: Record<string, string>) {
    const params = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) params.set(k, v); else params.delete(k);
    }
    router.push(`/empreendimentos?${params.toString()}#lista`, { scroll: false });
  }

  const selectCls = "h-11 w-full appearance-none border border-[#0a2a66]/30 bg-white px-4 pr-9 text-[13px] uppercase tracking-wide text-[#0a2a66] outline-none focus:border-[#0a2a66]";

  return (
    <div className="flex flex-col gap-6">
      {/* tabs de status */}
      <div className="flex flex-wrap bg-[#0a2a66] text-white">
        {STATUS_TABS.map((t) => {
          const on = status === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => navegar({ status: on ? "" : t.value })}
              className={`min-w-[50%] flex-1 px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wide transition sm:min-w-0 sm:px-5 sm:py-4 sm:text-[13px] ${on ? "bg-white/15" : "hover:bg-white/10"}`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* selects */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Select label="Bairro" value={bairro} opts={bairroOpts} onChange={(v) => navegar({ bairro: v })} cls={selectCls} />
        <Select label="Tipo de Imóvel" value={tipo} opts={tipoOpts} onChange={(v) => navegar({ tipo: v })} cls={selectCls} />
        <Select label="Tipologia" value={tipologia} opts={tipologiaOpts} onChange={(v) => navegar({ tipologia: v })} cls={selectCls} />
      </div>
    </div>
  );
}

function Select({ label, value, opts, onChange, cls }: { label: string; value?: string; opts: Opcao[]; onChange: (v: string) => void; cls: string }) {
  return (
    <div className="relative">
      <select aria-label={label} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={cls}>
        <option value="">{label}</option>
        {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#0a2a66]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
    </div>
  );
}
