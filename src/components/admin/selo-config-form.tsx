"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { salvarSeloConfig } from "@/actions/selo";
import { SELO_POSICOES, seloPosClasses, isSeloBottom, seloAlignSelf, type SeloConfig } from "@/lib/selo";

const SELO_PREVIEW = "/selos/his-hmp.jpg";

export function SeloConfigForm({ inicial }: { inicial: SeloConfig }) {
  const [cfg, setCfg] = useState<SeloConfig>(inicial);
  const [estado, setEstado] = useState<"idle" | "ok" | "erro">("idle");
  const [pending, start] = useTransition();

  const set = <K extends keyof SeloConfig>(k: K, v: SeloConfig[K]) => setCfg((c) => ({ ...c, [k]: v }));
  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(v) ? v : min));

  function salvar() {
    setEstado("idle");
    start(async () => {
      const r = await salvarSeloConfig(cfg);
      setEstado(r.ok ? "ok" : "erro");
      if (r.ok) toast.success("Configurações do selo salvas.");
      else toast.error(r.erro ?? "Falha ao salvar.");
    });
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* Controles */}
      <div className="flex flex-1 flex-col gap-6">
        <div className="rounded-xl border border-border bg-surface p-6 shadow-xs">
          <div className="border-b border-border pb-4">
            <h2 className="text-[15px] font-semibold">Selo de Habitação</h2>
            <p className="mt-0.5 text-[13px] text-foreground-secondary">
              Selo da Prefeitura de São Paulo exibido sobre as cards dos empreendimentos Viva Benx (HIS, HMP).
            </p>
          </div>

          {/* Posição */}
          <div className="mt-5">
            <span className="text-[13px] font-medium">Posição na card</span>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {SELO_POSICOES.map((p) => {
                const ativo = cfg.posicao === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => set("posicao", p.value)}
                    aria-pressed={ativo}
                    className={`border px-3 py-2 text-[12px] font-medium transition-colors ${
                      ativo
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border text-foreground-secondary hover:border-border-emphasis hover:text-foreground"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Numéricos */}
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium">Tamanho (% da largura)</span>
              <Input
                type="number"
                min={10}
                max={80}
                value={cfg.tamanho}
                onChange={(e) => set("tamanho", clamp(parseInt(e.target.value, 10), 10, 80))}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium">Margem (px)</span>
              <Input
                type="number"
                min={0}
                max={40}
                value={cfg.margem}
                onChange={(e) => set("margem", clamp(parseInt(e.target.value, 10), 0, 40))}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium">Opacidade (%)</span>
              <Input
                type="number"
                min={20}
                max={100}
                value={cfg.opacidade}
                onChange={(e) => set("opacidade", clamp(parseInt(e.target.value, 10), 20, 100))}
              />
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={salvar} disabled={pending}>
            {pending ? "Salvando..." : "Salvar configurações"}
          </Button>
          {estado === "ok" && <span className="text-[13px] font-medium text-success">Salvo.</span>}
          {estado === "erro" && <span className="text-[13px] font-medium text-error">Falha ao salvar.</span>}
        </div>
      </div>

      {/* Preview ao vivo */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-xs lg:w-[340px]">
        <h2 className="border-b border-border pb-4 text-[15px] font-semibold">Pré-visualização</h2>
        <p className="mt-3 text-[12px] text-foreground-tertiary">
          Atualiza em tempo real conforme você ajusta os campos.
        </p>
        <div className="mt-4 flex justify-center">
          <div className="relative aspect-[3/4] w-[280px] overflow-hidden bg-neutral-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/placeholder-card.jpg" alt="" className="h-full w-full object-cover" />
            {/* posições superiores: selo absoluto sobre a foto */}
            {!isSeloBottom(cfg.posicao) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={SELO_PREVIEW}
                alt="Selo de habitação"
                className={`pointer-events-none absolute z-20 h-auto ${seloPosClasses(cfg.posicao)}`}
                style={{ width: `${cfg.tamanho}%`, margin: `${cfg.margem}px`, opacity: cfg.opacidade / 100 }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/25" />
            {/* posições inferiores: selo empilha ACIMA do título, com margem */}
            <div className="absolute inset-x-0 bottom-0 flex flex-col p-4">
              {isSeloBottom(cfg.posicao) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={SELO_PREVIEW}
                  alt="Selo de habitação"
                  className={`pointer-events-none h-auto ${seloAlignSelf(cfg.posicao)}`}
                  style={{ width: `${cfg.tamanho}%`, marginBottom: `${cfg.margem}px`, opacity: cfg.opacidade / 100 }}
                />
              )}
              <p className="text-[18px] font-bold leading-tight tracking-tight text-white drop-shadow">Exemplo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
