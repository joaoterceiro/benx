"use client";

import { useState, useTransition } from "react";
import { ChevronUp, ChevronDown, Trash2, Plus, CornerDownRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { salvarMenuItens, salvarMenuConfig, type MenuItemInput, type MenuConfigInput } from "@/actions/menu";

interface Linha {
  key: string;
  texto: string;
  url: string;
  parentKey: string | null;
  ativo: boolean;
}

interface Props {
  itensIniciais: { id: string; texto: string; url: string; parentId: string | null; ativo: boolean; ordem: number }[];
  configInicial: MenuConfigInput;
}

let contador = 0;
const novaKey = () => `k${contador++}`;

export function MenuEditor({ itensIniciais, configInicial }: Props) {
  const [linhas, setLinhas] = useState<Linha[]>(() => {
    // Mapeia ids reais -> keys locais para preservar hierarquia ao editar.
    const idParaKey = new Map<string, string>();
    for (const i of itensIniciais) idParaKey.set(i.id, novaKey());
    return itensIniciais.map((i) => ({
      key: idParaKey.get(i.id)!,
      texto: i.texto,
      url: i.url,
      parentKey: i.parentId ? idParaKey.get(i.parentId) ?? null : null,
      ativo: i.ativo,
    }));
  });
  const [cfg, setCfg] = useState<MenuConfigInput>(configInicial);
  const [estado, setEstado] = useState<"idle" | "ok" | "erro">("idle");
  const [pending, start] = useTransition();

  const raizes = linhas.filter((l) => !l.parentKey);

  function atualizar(key: string, patch: Partial<Linha>) {
    setLinhas((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }
  function remover(key: string) {
    // remove o item e promove seus filhos a raiz
    setLinhas((ls) => ls.filter((l) => l.key !== key).map((l) => (l.parentKey === key ? { ...l, parentKey: null } : l)));
  }
  function adicionar() {
    setLinhas((ls) => [...ls, { key: novaKey(), texto: "", url: "", parentKey: null, ativo: true }]);
  }
  function mover(key: string, dir: -1 | 1) {
    setLinhas((ls) => {
      const i = ls.findIndex((l) => l.key === key);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= ls.length) return ls;
      const copia = [...ls];
      [copia[i], copia[j]] = [copia[j], copia[i]];
      return copia;
    });
  }

  function salvar() {
    setEstado("idle");
    start(async () => {
      const itens: MenuItemInput[] = linhas.map((l, idx) => ({
        key: l.key,
        texto: l.texto,
        url: l.url,
        ordem: idx + 1,
        parentKey: l.parentKey,
        ativo: l.ativo,
      }));
      const r1 = await salvarMenuItens(itens);
      const r2 = await salvarMenuConfig(cfg);
      const ok = r1.ok && r2.ok;
      setEstado(ok ? "ok" : "erro");
      if (ok) toast.success("Menu salvo.");
      else toast.error(r1.erro ?? r2.erro ?? "Falha ao salvar.");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Itens */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-[15px] font-semibold">Itens do menu</h2>
            <p className="mt-0.5 text-[13px] text-foreground-secondary">Ordem de cima para baixo. Marque um pai para criar subitens.</p>
          </div>
          <Button variant="outline" onClick={adicionar}><Plus size={15} className="mr-1" /> Item</Button>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {linhas.length === 0 && (
            <p className="py-6 text-center text-[13px] text-foreground-tertiary">Nenhum item. Clique em &quot;Item&quot; para começar.</p>
          )}
          {linhas.map((l, idx) => (
            <div
              key={l.key}
              className={`flex flex-wrap items-center gap-2 rounded-lg border border-border px-3 py-2 ${l.parentKey ? "ml-8 bg-muted/40" : "bg-surface"}`}
            >
              {l.parentKey && <CornerDownRight size={15} className="text-foreground-tertiary" />}
              <div className="flex flex-col">
                <button type="button" onClick={() => mover(l.key, -1)} disabled={idx === 0} className="text-foreground-tertiary hover:text-foreground disabled:opacity-30"><ChevronUp size={14} /></button>
                <button type="button" onClick={() => mover(l.key, 1)} disabled={idx === linhas.length - 1} className="text-foreground-tertiary hover:text-foreground disabled:opacity-30"><ChevronDown size={14} /></button>
              </div>
              <Input value={l.texto} onChange={(e) => atualizar(l.key, { texto: e.target.value })} placeholder="Texto" className="w-40" />
              <Input value={l.url} onChange={(e) => atualizar(l.key, { url: e.target.value })} placeholder="/url" className="w-44" />
              <select
                value={l.parentKey ?? ""}
                onChange={(e) => atualizar(l.key, { parentKey: e.target.value || null })}
                className="h-9 rounded-lg border border-border bg-surface px-2 text-[13px] outline-none focus:border-accent"
              >
                <option value="">Item raiz</option>
                {raizes.filter((r) => r.key !== l.key).map((r) => (
                  <option key={r.key} value={r.key}>↳ sob: {r.texto || "(sem nome)"}</option>
                ))}
              </select>
              <label className="flex items-center gap-1.5 text-[12px] text-foreground-secondary">
                <input type="checkbox" checked={l.ativo} onChange={(e) => atualizar(l.key, { ativo: e.target.checked })} />
                Ativo
              </label>
              <button type="button" onClick={() => remover(l.key)} className="ml-auto text-foreground-tertiary hover:text-error"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Rodapé do menu */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-xs">
        <h2 className="border-b border-border pb-4 text-[15px] font-semibold">Rodapé do menu</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">Logo (URL)</span>
            <Input value={cfg.footerLogo} onChange={(e) => setCfg({ ...cfg, footerLogo: e.target.value })} placeholder="/logo-benx-branco.png" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">Título</span>
            <Input value={cfg.footerTitulo} onChange={(e) => setCfg({ ...cfg, footerTitulo: e.target.value })} placeholder="BENX" />
          </label>
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-[13px] font-medium">Contato</span>
            <textarea
              value={cfg.footerContato}
              onChange={(e) => setCfg({ ...cfg, footerContato: e.target.value })}
              rows={3}
              className="w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-foreground shadow-xs outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
            />
          </label>
        </div>
      </div>

      {/* Tipografia */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-xs">
        <h2 className="border-b border-border pb-4 text-[15px] font-semibold">Tipografia</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <NumCampo label="Tamanho raiz (px)" value={cfg.rootSize} onChange={(v) => setCfg({ ...cfg, rootSize: v })} />
          <NumCampo label="Peso raiz" value={cfg.rootWeight} onChange={(v) => setCfg({ ...cfg, rootWeight: v })} />
          <NumCampo label="Tamanho subitem (px)" value={cfg.subSize} onChange={(v) => setCfg({ ...cfg, subSize: v })} />
          <NumCampo label="Peso subitem" value={cfg.subWeight} onChange={(v) => setCfg({ ...cfg, subWeight: v })} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={salvar} disabled={pending}>{pending ? "Salvando..." : "Salvar menu"}</Button>
        {estado === "ok" && <span className="text-[13px] font-medium text-success">Salvo.</span>}
        {estado === "erro" && <span className="text-[13px] font-medium text-error">Falha ao salvar.</span>}
      </div>
    </div>
  );
}

function NumCampo({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium">{label}</span>
      <Input type="number" value={value} onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)} />
    </label>
  );
}
