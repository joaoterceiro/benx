"use client";

import { useMemo, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowUp, ArrowDown, X, Plus, Search, Shuffle, LayoutGrid } from "lucide-react";
import { salvarDestaquesHome } from "@/actions/home-cards";
import { statusObraLabel } from "@/lib/labels";
import { CROSS_PROMO } from "@/lib/ecossistema";

type Item = { id: string; nome: string; ordemHome: number; statusObra: string };
type Grupo = { value: string; label: string; slug: string; items: Item[] };
type ModoStrip = "fixados_aleatorio" | "fixados_tags_aleatorio" | "fixados_tags_recentes" | "so_tags";
type StripCols = { mobile: number; tablet: number; desktop: number; wide: number };
type StripConfig = { cols: StripCols; modo: ModoStrip; tags: string[] };

const MODOS: { v: ModoStrip; label: string; usaTags: boolean }[] = [
  { v: "fixados_aleatorio", label: "Fixados, depois aleatório", usaTags: false },
  { v: "fixados_tags_aleatorio", label: "Fixados, depois por tags (aleatório na tag)", usaTags: true },
  { v: "fixados_tags_recentes", label: "Fixados, depois por tags (mais recentes na tag)", usaTags: true },
  { v: "so_tags", label: "Só por tags (ignora fixados)", usaTags: true },
];
const BREAKPOINTS: { k: keyof StripCols; label: string; faixa: string }[] = [
  { k: "mobile", label: "Celular", faixa: "< 640px" },
  { k: "tablet", label: "Tablet", faixa: "640–1024" },
  { k: "desktop", label: "Desktop", faixa: "1024–1280" },
  { k: "wide", label: "Desktop grande", faixa: "> 1280px" },
];

const clampNum = (s: string): number => {
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? Math.min(6, Math.max(1, n)) : 1;
};

export function HomeCardsForm({
  grupos,
  configs,
  promos,
}: {
  grupos: Grupo[];
  configs: Record<string, StripConfig>;
  promos: Record<string, string[]>;
}) {
  // A faixa "Conheça nossa linha" de cada home promove OUTRA linha (cross-promo).
  const byValue = new Map(grupos.map((g) => [g.value, g]));
  const promoAlvo = (v: string): Grupo | undefined => byValue.get(CROSS_PROMO[v as keyof typeof CROSS_PROMO]);

  const [pins, setPins] = useState<Record<string, string[]>>(() => {
    const o: Record<string, string[]> = {};
    grupos.forEach((g) => {
      o[g.value] = g.items.filter((i) => i.ordemHome > 0).sort((a, b) => a.ordemHome - b.ordemHome).map((i) => i.id);
    });
    return o;
  });
  const [promoPins, setPromoPins] = useState<Record<string, string[]>>(() => {
    const o: Record<string, string[]> = {};
    grupos.forEach((g) => {
      // os ids salvos são da linha PROMOVIDA, não da própria linha do grupo
      const validos = new Set((promoAlvo(g.value)?.items ?? []).map((i) => i.id));
      o[g.value] = (promos[g.value] ?? []).filter((id) => validos.has(id));
    });
    return o;
  });
  const [cfgs, setCfgs] = useState<Record<string, StripConfig>>(configs);
  const [pending, start] = useTransition();

  function salvar() {
    const vertentes = grupos.map((g) => ({
      value: g.value,
      ids: pins[g.value] ?? [],
      cols: cfgs[g.value].cols,
      modo: cfgs[g.value].modo,
      tags: cfgs[g.value].tags,
      promos: promoPins[g.value] ?? [],
    }));
    start(async () => {
      const r = await salvarDestaquesHome({ vertentes });
      if (r.ok) toast.success("Configurações da home salvas.");
      else toast.error(r.erro ?? "Falha ao salvar.");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[18px] font-semibold">Cards da Home</h1>
        <p className="mt-0.5 text-[13px] text-foreground-secondary">
          Por home: fixe os primeiros empreendimentos, defina quantos cards aparecem por tela, como o restante é ordenado e a sequência da faixa &ldquo;Conheça mais a&rdquo;.
        </p>
      </div>

      {grupos.map((g) => {
        const alvo = promoAlvo(g.value);
        return (
          <GrupoHome
            key={g.value}
            grupo={g}
            pins={pins[g.value] ?? []}
            setPins={(ids) => setPins((p) => ({ ...p, [g.value]: ids }))}
            promo={promoPins[g.value] ?? []}
            setPromo={(ids) => setPromoPins((p) => ({ ...p, [g.value]: ids }))}
            promoItens={alvo?.items ?? []}
            promoLabel={alvo?.label ?? ""}
            cfg={cfgs[g.value]}
            setCfg={(c) => setCfgs((p) => ({ ...p, [g.value]: c }))}
          />
        );
      })}

      <div className="sticky bottom-0 flex items-center gap-3 border-t border-border bg-background/90 py-3 backdrop-blur">
        <Button variant="primary" onClick={salvar} disabled={pending}>{pending ? "Salvando..." : "Salvar configurações"}</Button>
      </div>
    </div>
  );
}

function GrupoHome({
  grupo, pins, setPins, promo, setPromo, promoItens, promoLabel, cfg, setCfg,
}: {
  grupo: Grupo;
  pins: string[];
  setPins: (ids: string[]) => void;
  promo: string[];
  setPromo: (ids: string[]) => void;
  promoItens: Item[];
  promoLabel: string;
  cfg: StripConfig;
  setCfg: (c: StripConfig) => void;
}) {
  const modoInfo = MODOS.find((m) => m.v === cfg.modo) ?? MODOS[0];

  const setCol = (k: keyof StripCols, v: number) => setCfg({ ...cfg, cols: { ...cfg.cols, [k]: v } });
  const moveTag = (idx: number, dir: -1 | 1) => {
    const alvo = idx + dir;
    if (alvo < 0 || alvo >= cfg.tags.length) return;
    const tags = [...cfg.tags];
    [tags[idx], tags[alvo]] = [tags[alvo], tags[idx]];
    setCfg({ ...cfg, tags });
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-xs">
      <div className="border-b border-border pb-4">
        <h2 className="text-[15px] font-semibold">Home {grupo.label}</h2>
        <p className="mt-0.5 text-[13px] text-foreground-secondary">/{grupo.slug} · {grupo.items.length} empreendimentos</p>
      </div>

      {/* Fixados na faixa principal */}
      <Picker
        titulo={`Primeiros a aparecer (${pins.length})`}
        itens={grupo.items}
        ids={pins}
        setIds={setPins}
        placeholder="Buscar empreendimento para fixar..."
        rotuloAdd="Fixar"
        vazio="Nenhum fixado."
      />

      {/* Layout: cards por tela */}
      <div className="mt-6 border-t border-border pt-5">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-foreground-tertiary">Cards por tela</p>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {BREAKPOINTS.map((b) => (
            <label key={b.k} className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium">{b.label} <span className="text-foreground-tertiary">({b.faixa})</span></span>
              <Input type="number" min={1} max={6} value={cfg.cols[b.k]} onChange={(e) => setCol(b.k, clampNum(e.target.value))} />
            </label>
          ))}
        </div>
      </div>

      {/* Ordenação do restante */}
      <div className="mt-6 border-t border-border pt-5">
        <p className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-foreground-tertiary"><Shuffle size={13} /> Ordenação do restante</p>
        <select
          value={cfg.modo}
          onChange={(e) => setCfg({ ...cfg, modo: e.target.value as ModoStrip })}
          className="mt-2 h-9 w-full rounded-lg border border-border bg-surface px-3 text-[13px]"
        >
          {MODOS.map((m) => <option key={m.v} value={m.v}>{m.label}</option>)}
        </select>
        {modoInfo.usaTags && (
          <div className="mt-3">
            <p className="text-[12px] text-foreground-tertiary">Sequência das tags (a primeira aparece antes):</p>
            <ul className="mt-2 flex flex-col divide-y divide-border rounded-lg border border-border">
              {cfg.tags.map((t, idx) => (
                <li key={t} className="flex items-center gap-3 px-3 py-2">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded bg-muted text-[12px] font-semibold">{idx + 1}</span>
                  <span className="flex-1 text-[14px]">{statusObraLabel(t)}</span>
                  <div className="flex items-center gap-1">
                    <IconBtn label="Subir" onClick={() => moveTag(idx, -1)} disabled={idx === 0}><ArrowUp size={15} /></IconBtn>
                    <IconBtn label="Descer" onClick={() => moveTag(idx, 1)} disabled={idx === cfg.tags.length - 1}><ArrowDown size={15} /></IconBtn>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Faixa "Conheça nossa linha <promoLabel>" exibida NESTA home, promovendo
          a linha cross-promovida (ex.: na home Benx aparece a linha VivaBenx). */}
      <div className="mt-6 border-t border-border pt-5">
        <p className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-foreground-tertiary">
          <LayoutGrid size={13} /> Faixa &ldquo;Conheça mais a {promoLabel}&rdquo;
        </p>
        <p className="mt-1 text-[12px] text-foreground-tertiary">
          Empreendimentos da linha <strong>{promoLabel}</strong> que aparecem nessa faixa na home <strong>{grupo.label}</strong>. Se vazio, usa a ordem padrão da linha {promoLabel}.
        </p>
        <Picker
          itens={promoItens}
          ids={promo}
          setIds={setPromo}
          placeholder={`Buscar empreendimento ${promoLabel} para a faixa...`}
          rotuloAdd="Adicionar"
          vazio={`Nenhum selecionado — usa a ordem padrão da linha ${promoLabel}.`}
          semTopo
        />
      </div>
    </div>
  );
}

// Lista ordenável de empreendimentos com busca (reusada em fixados e na faixa promo).
function Picker({
  titulo, itens, ids, setIds, placeholder, rotuloAdd, vazio, semTopo,
}: {
  titulo?: string;
  itens: Item[];
  ids: string[];
  setIds: (ids: string[]) => void;
  placeholder: string;
  rotuloAdd: string;
  vazio: string;
  semTopo?: boolean;
}) {
  const [busca, setBusca] = useState("");
  const byId = useMemo(() => new Map(itens.map((i) => [i.id, i])), [itens]);

  const selecionados = ids.map((id) => byId.get(id)).filter(Boolean) as Item[];
  const disponiveis = itens.filter((i) => !ids.includes(i.id));
  const resultados = busca.trim()
    ? disponiveis.filter((i) => i.nome.toLowerCase().includes(busca.trim().toLowerCase())).slice(0, 8)
    : [];

  const add = (id: string) => { setIds([...ids, id]); setBusca(""); };
  const remove = (id: string) => setIds(ids.filter((x) => x !== id));
  const move = (idx: number, dir: -1 | 1) => {
    const alvo = idx + dir;
    if (alvo < 0 || alvo >= ids.length) return;
    const next = [...ids];
    [next[idx], next[alvo]] = [next[alvo], next[idx]];
    setIds(next);
  };

  return (
    <div className={semTopo ? "mt-3" : "mt-4"}>
      {titulo && <p className="text-[12px] font-semibold uppercase tracking-wide text-foreground-tertiary">{titulo}</p>}
      {selecionados.length === 0 ? (
        <p className="mt-2 text-[13px] text-foreground-tertiary">{vazio}</p>
      ) : (
        <ul className="mt-2 flex flex-col divide-y divide-border">
          {selecionados.map((i, idx) => (
            <li key={i.id} className="flex items-center gap-3 py-2.5">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-muted text-[12px] font-semibold">{idx + 1}</span>
              <span className="flex-1 text-[14px] font-medium">{i.nome}</span>
              <span className="hidden text-[12px] text-foreground-tertiary sm:inline">{statusObraLabel(i.statusObra)}</span>
              <div className="flex items-center gap-1">
                <IconBtn label="Subir" onClick={() => move(idx, -1)} disabled={idx === 0}><ArrowUp size={15} /></IconBtn>
                <IconBtn label="Descer" onClick={() => move(idx, 1)} disabled={idx === selecionados.length - 1}><ArrowDown size={15} /></IconBtn>
                <IconBtn label="Remover" onClick={() => remove(i.id)}><X size={15} /></IconBtn>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground-tertiary" />
          <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={placeholder} className="pl-9" />
        </div>
        {resultados.length > 0 && (
          <ul className="mt-2 flex flex-col divide-y divide-border rounded-lg border border-border">
            {resultados.map((i) => (
              <li key={i.id} className="flex items-center gap-3 px-3 py-2">
                <span className="flex-1 text-[14px]">{i.nome}</span>
                <span className="hidden text-[12px] text-foreground-tertiary sm:inline">{statusObraLabel(i.statusObra)}</span>
                <Button variant="outline" size="sm" onClick={() => add(i.id)}><Plus size={14} /> {rotuloAdd}</Button>
              </li>
            ))}
          </ul>
        )}
        {busca.trim() && resultados.length === 0 && <p className="mt-2 text-[13px] text-foreground-tertiary">Nenhum resultado.</p>}
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
