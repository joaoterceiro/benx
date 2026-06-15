"use client";

import { useRef, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowUp, ArrowDown, X, Plus, RotateCcw } from "lucide-react";
import { RichText } from "@/components/admin/rich-text";
import { salvarInfoHabitacao } from "@/actions/info-habitacao";
import { INFO_DEFAULTS, INFO_VARIANTES, type ChaveInfo, type VarianteInfo } from "@/lib/info-habitacao";

type SecaoEdit = { _id: number; q: string; html: string };
type VarEdit = { titulo: string; secoes: SecaoEdit[] };

export function InfoHabitacaoForm({ inicial }: { inicial: Record<ChaveInfo, VarianteInfo> }) {
  const idRef = useRef(0);
  const nid = () => ++idRef.current;
  const aVar = (v: VarianteInfo): VarEdit => ({ titulo: v.titulo, secoes: v.secoes.map((s) => ({ _id: nid(), q: s.q, html: s.html })) });

  const [vars, setVars] = useState<Record<ChaveInfo, VarEdit>>(() => ({
    his_hmp: aVar(inicial.his_hmp),
    his: aVar(inicial.his),
    hmp: aVar(inicial.hmp),
  }));
  const [ativa, setAtiva] = useState<ChaveInfo>("his_hmp");
  const [pending, start] = useTransition();

  const v = vars[ativa];
  const setV = (next: VarEdit) => setVars((p) => ({ ...p, [ativa]: next }));
  const setSecao = (idx: number, patch: Partial<SecaoEdit>) =>
    setV({ ...v, secoes: v.secoes.map((s, i) => (i === idx ? { ...s, ...patch } : s)) });
  const remover = (idx: number) => setV({ ...v, secoes: v.secoes.filter((_, i) => i !== idx) });
  const mover = (idx: number, dir: -1 | 1) => {
    const alvo = idx + dir;
    if (alvo < 0 || alvo >= v.secoes.length) return;
    const s = [...v.secoes];
    [s[idx], s[alvo]] = [s[alvo], s[idx]];
    setV({ ...v, secoes: s });
  };
  const adicionar = () => setV({ ...v, secoes: [...v.secoes, { _id: nid(), q: "", html: "" }] });
  const restaurar = () => setV(aVar(INFO_DEFAULTS[ativa]));

  function salvar() {
    const payload = Object.fromEntries(
      (Object.keys(vars) as ChaveInfo[]).map((k) => [k, { titulo: vars[k].titulo, secoes: vars[k].secoes.map((s) => ({ q: s.q, html: s.html })) }])
    ) as Record<ChaveInfo, VarianteInfo>;
    start(async () => {
      const r = await salvarInfoHabitacao(payload);
      if (r.ok) toast.success("Informações de habitação salvas.");
      else toast.error(r.erro ?? "Falha ao salvar.");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[18px] font-semibold">Informações HIS / HMP</h1>
        <p className="mt-0.5 text-[13px] text-foreground-secondary">
          Conteúdo da seção colapsável exibida nas páginas Viva Benx, conforme o tipo de habitação do empreendimento.
        </p>
      </div>

      {/* Seletor de variante */}
      <div className="flex flex-wrap gap-1 rounded-lg border border-border p-1">
        {INFO_VARIANTES.map((opt) => (
          <button
            key={opt.chave}
            type="button"
            onClick={() => setAtiva(opt.chave)}
            className={`rounded-md px-4 py-1.5 text-[13px] font-medium transition-colors ${
              ativa === opt.chave ? "bg-foreground text-background" : "text-foreground-secondary hover:bg-black/[0.04]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 shadow-xs">
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium">Título da seção</span>
          <Input value={v.titulo} onChange={(e) => setV({ ...v, titulo: e.target.value })} placeholder="Informações importantes sobre HIS e HMP" />
        </label>

        <div className="mt-6 flex items-center justify-between">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-foreground-tertiary">Perguntas ({v.secoes.length})</span>
          <Button variant="outline" size="sm" onClick={restaurar} disabled={pending}><RotateCcw size={14} /> Restaurar padrão</Button>
        </div>

        <div className="mt-3 flex flex-col gap-5">
          {v.secoes.map((s, idx) => (
            <div key={s._id} className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2">
                <Input value={s.q} onChange={(e) => setSecao(idx, { q: e.target.value })} placeholder="Pergunta (ex.: O que é?)" className="flex-1 font-medium" />
                <div className="flex items-center gap-1">
                  <IconBtn label="Subir" onClick={() => mover(idx, -1)} disabled={idx === 0}><ArrowUp size={15} /></IconBtn>
                  <IconBtn label="Descer" onClick={() => mover(idx, 1)} disabled={idx === v.secoes.length - 1}><ArrowDown size={15} /></IconBtn>
                  <IconBtn label="Remover" onClick={() => remover(idx)}><X size={15} /></IconBtn>
                </div>
              </div>
              <div className="mt-3">
                <RichText key={s._id} value={s.html} onChange={(html) => setSecao(idx, { html })} placeholder="Resposta…" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <Button variant="outline" onClick={adicionar} disabled={pending}><Plus size={15} /> Adicionar pergunta</Button>
        </div>
      </div>

      <div className="sticky bottom-0 flex items-center gap-3 border-t border-border bg-background/90 py-3 backdrop-blur">
        <Button variant="primary" onClick={salvar} disabled={pending}>{pending ? "Salvando..." : "Salvar configurações"}</Button>
        <span className="text-[12px] text-foreground-tertiary">Salva as 3 variantes (HIS e HMP, HIS, HMP).</span>
      </div>
    </div>
  );
}

function IconBtn({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="grid h-8 w-8 place-items-center rounded-md border border-border text-foreground-secondary transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}
