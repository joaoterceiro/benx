"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { salvarBuscaConfig } from "@/actions/busca";
import type { BuscaConfig } from "@/lib/busca-config";

export function BuscaConfigForm({ inicial }: { inicial: BuscaConfig }) {
  const [cfg, setCfg] = useState<BuscaConfig>(inicial);
  const [estado, setEstado] = useState<"idle" | "ok" | "erro">("idle");
  const [pending, start] = useTransition();

  const set = <K extends keyof BuscaConfig>(k: K, v: BuscaConfig[K]) => setCfg((c) => ({ ...c, [k]: v }));

  function salvar() {
    setEstado("idle");
    start(async () => {
      const r = await salvarBuscaConfig(cfg);
      setEstado(r.ok ? "ok" : "erro");
      if (r.ok) toast.success("Configurações da busca salvas.");
      else toast.error(r.erro ?? "Falha ao salvar.");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Aparência */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-xs">
        <div className="border-b border-border pb-4">
          <h2 className="text-[15px] font-semibold">Busca de imóveis</h2>
          <p className="mt-0.5 text-[13px] text-foreground-secondary">Modal de busca aberto pela lupa, exibido em todas as páginas.</p>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">Título</span>
            <Input value={cfg.titulo} onChange={(e) => set("titulo", e.target.value)} placeholder="Buscar Imóveis" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">Texto do campo (placeholder)</span>
            <Input value={cfg.placeholder} onChange={(e) => set("placeholder", e.target.value)} placeholder="Buscar empreendimento..." />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">Cor primária</span>
            <div className="flex items-center gap-2">
              <input type="color" value={cfg.cor} onChange={(e) => set("cor", e.target.value)} className="h-9 w-12 cursor-pointer rounded border border-border bg-surface p-1" />
              <Input value={cfg.cor} onChange={(e) => set("cor", e.target.value)} placeholder="#002A5C" className="flex-1" />
            </div>
          </label>
        </div>
      </div>

      {/* Sugestões */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-xs">
        <h2 className="border-b border-border pb-4 text-[15px] font-semibold">Sugestões (tela inicial do modal)</h2>
        <div className="mt-4 flex flex-col divide-y divide-border">
          <Toggle label="Filtros avançados" descricao="Acordeão com tipo, tipologia, cidade, bairro e status." valor={cfg.mostrarFiltros} onChange={(v) => set("mostrarFiltros", v)} cor={cfg.cor} />
          <Toggle label="Cidades populares" descricao="Atalhos para as cidades com mais empreendimentos." valor={cfg.mostrarCidades} onChange={(v) => set("mostrarCidades", v)} cor={cfg.cor} />
          <Toggle label="Tipos de imóvel" descricao="Atalhos por tipo de habitação." valor={cfg.mostrarTipos} onChange={(v) => set("mostrarTipos", v)} cor={cfg.cor} />
          <Toggle label="Adicionados recentemente" descricao="Lista dos empreendimentos mais recentes." valor={cfg.mostrarRecentes} onChange={(v) => set("mostrarRecentes", v)} cor={cfg.cor} />
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">Qtd. de cidades populares</span>
            <Input type="number" min={0} value={cfg.qtdCidades} onChange={(e) => set("qtdCidades", parseInt(e.target.value, 10) || 0)} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">Qtd. de recentes</span>
            <Input type="number" min={0} value={cfg.qtdRecentes} onChange={(e) => set("qtdRecentes", parseInt(e.target.value, 10) || 0)} />
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={salvar} disabled={pending}>{pending ? "Salvando..." : "Salvar configurações"}</Button>
        {estado === "ok" && <span className="text-[13px] font-medium text-success">Salvo.</span>}
        {estado === "erro" && <span className="text-[13px] font-medium text-error">Falha ao salvar.</span>}
      </div>
    </div>
  );
}

function Toggle({ label, descricao, valor, onChange, cor }: { label: string; descricao: string; valor: boolean; onChange: (v: boolean) => void; cor: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-[13px] font-medium">{label}</p>
        <p className="mt-0.5 text-[12px] text-foreground-tertiary">{descricao}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={valor}
        onClick={() => onChange(!valor)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${valor ? "" : "bg-border-emphasis"}`}
        style={valor ? { background: cor } : undefined}
      >
        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${valor ? "translate-x-[20px]" : "translate-x-0"}`} />
      </button>
    </div>
  );
}
