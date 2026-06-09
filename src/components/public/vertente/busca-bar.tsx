"use client";

import { FiltroSelect } from "@/components/public/vertente/filtro-select";
import { abrirBuscaComFiltros } from "@/components/public/busca-glass";

interface Opt { value: string; label: string }

// Barra de busca azul (faixa) da home da vertente. Ao buscar, abre o modal de
// pesquisa (Glass) com os filtros aplicados, reaproveitando os resultados dele.
export function BuscaBar({
  action, status, bairro, statusOpts, bairroOpts,
}: {
  action: string;
  status?: string;
  bairro?: string;
  statusOpts: Opt[];
  bairroOpts: Opt[];
}) {
  const dormOpts = [1, 2, 3, 4].map((n) => ({ value: String(n), label: `${n}+ dormitórios` }));

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    abrirBuscaComFiltros({
      status: (fd.get("status") as string) || "",
      bairro: (fd.get("bairro") as string) || "",
    });
  }

  return (
    <div className="w-full bg-[#0A2A66]">
      <form onSubmit={onSubmit} method="get" action={action} className="mx-auto flex max-w-site flex-wrap items-center gap-x-5 gap-y-4 px-6 py-7 text-white">
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-[14px]">
            <input type="checkbox" name="tipo" value="residencial" className="h-4 w-4 accent-white" /> Residencial
          </label>
          <label className="flex items-center gap-2 text-[14px]">
            <input type="checkbox" name="tipo" value="comercial" className="h-4 w-4 accent-white" /> Comercial
          </label>
        </div>

        <span className="hidden h-9 w-px bg-white/20 sm:block" />

        <FiltroSelect name="status" placeholder="Todos os Status" options={statusOpts} defaultValue={status ?? ""} />
        <FiltroSelect name="bairro" placeholder="Todos os Bairros" options={bairroOpts} defaultValue={bairro ?? ""} />
        <FiltroSelect name="dorm" placeholder="Dormitórios" options={dormOpts} />

        <button type="submit" className="h-11 w-full bg-[#e11d2a] px-10 text-[14px] font-semibold uppercase tracking-[0.1em] text-white transition duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg sm:ml-auto sm:w-auto">
          Buscar
        </button>
      </form>
    </div>
  );
}
