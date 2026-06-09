"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { DadosBusca, BuscaItem, BuscaFacet } from "@/db/queries";
import type { BuscaConfig } from "@/lib/busca-config";

// ── Store de abertura (gatilho e modal vivem separados) ───────────────────
let aberto = false;
let pendentes: { status?: string; bairro?: string; cidade?: string; tipo?: string } | null = null;
const ouvintes = new Set<(v: boolean) => void>();
export function abrirBusca() { pendentes = null; aberto = true; ouvintes.forEach((f) => f(true)); }
export function abrirBuscaComFiltros(f: { status?: string; bairro?: string; cidade?: string; tipo?: string }) {
  pendentes = f; aberto = true; ouvintes.forEach((fn) => fn(true));
}
function fecharBusca() { aberto = false; ouvintes.forEach((f) => f(false)); }

// Cor primária (definida pela config no render do modal; instância única).
let PRIMARY = "#002A5C";

// Ícone de lupa que abre a busca
export function BuscaTrigger({ className = "", color = "#ffffff" }: { className?: string; color?: string }) {
  return (
    <button type="button" aria-label="Buscar imóveis" onClick={abrirBusca} className={`grid place-items-center ${className}`} style={{ color }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
    </button>
  );
}

const Chevron = ({ className = "" }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="m6 9 6 6 6-6" /></svg>
);

// ── Dropdown glass reutilizável ───────────────────────────────────────────
function GlassDropdown({
  label, placeholder, options, value, onChange, disabled,
}: {
  label: string;
  placeholder: string;
  options: BuscaFacet[];
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const atual = options.find((o) => o.slug === value);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-white/45">{label}</label>
      <div ref={ref} className={`relative ${open ? "z-[60]" : "z-10"}`}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          className="flex h-[46px] w-full items-center justify-between border border-white/10 bg-white/[0.07] px-[18px] text-left text-[14px] text-white transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:bg-white/[0.03] disabled:text-white/30"
          style={open && !disabled ? { borderColor: "rgba(255,255,255,.28)", background: "rgba(255,255,255,.12)", boxShadow: "0 0 0 4px rgba(255,255,255,.06)" } : undefined}
        >
          <span className="truncate">{atual ? atual.nome : placeholder}</span>
          <Chevron className={`shrink-0 text-white/45 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && !disabled && (
          <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[70] max-h-[220px] overflow-y-auto border border-white/[0.18] p-1.5 shadow-[0_20px_50px_rgba(0,0,0,.5)]" style={{ background: "rgba(40,40,45,.97)", backdropFilter: "blur(20px)" }}>
            <Opcao ativo={value === ""} onClick={() => { onChange(""); setOpen(false); }}>{placeholder}</Opcao>
            {options.map((o) => (
              <Opcao key={o.slug} ativo={value === o.slug} onClick={() => { onChange(o.slug); setOpen(false); }}>
                {o.nome}{o.count != null ? <span className="ml-1 text-white/40">({o.count})</span> : null}
              </Opcao>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Opcao({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <div
      onClick={onClick}
      className={`my-0.5 cursor-pointer px-4 py-3 text-[14px] transition ${ativo ? "font-medium text-white" : "text-white/75 hover:bg-white/10 hover:text-white"}`}
      style={ativo ? { background: PRIMARY } : undefined}
    >
      {children}
    </div>
  );
}

const PinIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1116 0Z" /><circle cx="12" cy="10" r="3" /></svg>);

export function BuscaGlass({ dados, config }: { dados: DadosBusca; config: BuscaConfig }) {
  PRIMARY = config.cor || "#002A5C";
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [status, setStatus] = useState("");
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  const [items, setItems] = useState<BuscaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [vista, setVista] = useState<"suggest" | "loading" | "empty" | "error" | "list">("suggest");

  const inputRef = useRef<HTMLInputElement>(null);
  const buscarRef = useRef<() => void>(() => {});

  // Bairros da cidade selecionada
  const bairrosCidade = useMemo(
    () => (cidade ? dados.bairros.filter((b) => b.cidadeSlug === cidade) : []),
    [cidade, dados.bairros]
  );

  const ativos = [tipo, categoria, cidade, bairro, status].filter(Boolean).length;
  const semFiltro = ativos === 0 && q.trim().length === 0;

  // ── store + efeitos de abertura ──
  useEffect(() => {
    const o = (v: boolean) => {
      setOpen(v);
      if (v && pendentes) {
        setStatus(pendentes.status ?? "");
        setBairro(pendentes.bairro ?? "");
        setCidade(pendentes.cidade ?? "");
        setTipo(pendentes.tipo ?? "");
        setFiltrosAbertos(true);
        pendentes = null;
      }
    };
    ouvintes.add(o);
    setOpen(aberto);
    return () => { ouvintes.delete(o); };
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") fecharBusca(); };
    document.addEventListener("keydown", onKey);
    const t = setTimeout(() => inputRef.current?.focus(), 350);
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", onKey); clearTimeout(t); };
  }, [open]);

  async function buscar() {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (tipo) params.set("tipo", tipo);
    if (categoria) params.set("categoria", categoria);
    if (cidade) params.set("cidade", cidade);
    if (bairro) params.set("bairro", bairro);
    if (status) params.set("status", status);
    setVista("loading");
    try {
      const res = await fetch(`/api/busca?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || data.erro) { setVista("error"); return; }
      setItems(data.items);
      setTotal(data.total);
      setVista(data.items.length ? "list" : "empty");
    } catch {
      setVista("error");
    }
  }
  buscarRef.current = buscar;

  // Dispara busca (debounce) quando há query/filtros; volta às sugestões quando vazio.
  useEffect(() => {
    if (!open) return;
    if (semFiltro) { setVista("suggest"); setItems([]); return; }
    const t = setTimeout(() => buscarRef.current(), 320);
    return () => clearTimeout(t);
  }, [open, q, tipo, categoria, cidade, bairro, status, semFiltro]);

  function limparTudo() {
    setTipo(""); setCategoria(""); setCidade(""); setBairro(""); setStatus(""); setQ("");
  }

  return (
    <div
      aria-hidden={!open}
      onClick={fecharBusca}
      className={`fixed inset-0 z-[2147483000] transition-[opacity,visibility] duration-300 ${open ? "visible opacity-100" : "invisible opacity-0"}`}
      style={{ background: "rgba(0,0,0,.25)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", pointerEvents: open ? "auto" : "none" }}
    >
      {/* modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`fixed inset-x-0 bottom-0 top-0 flex flex-col transition-all duration-[350ms] ease-[cubic-bezier(.32,.72,0,1)] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[85vh] sm:w-[540px] sm:max-w-[94vw] sm:-translate-x-1/2 sm:border sm:border-white/15 ${open ? "translate-y-0 sm:-translate-y-1/2 sm:scale-100 sm:opacity-100" : "translate-y-full sm:-translate-y-[48%] sm:scale-95 sm:opacity-0"}`}
        style={{
          background: "rgba(22,22,27,.78)",
          backdropFilter: "blur(30px) saturate(140%)",
          WebkitBackdropFilter: "blur(30px) saturate(140%)",
        }}
      >
        {/* header */}
        <header className="flex shrink-0 items-center justify-between border-b border-white/[0.08] bg-white/[0.05] px-5 py-[18px]">
          <span className="text-[17px] font-semibold tracking-[-0.02em] text-white">{config.titulo}</span>
          <button type="button" aria-label="Fechar" onClick={fecharBusca} className="grid h-11 w-11 place-items-center border border-white/[0.12] bg-white/[0.08] text-white/70 transition hover:border-red-500 hover:bg-red-500 hover:text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </header>

        {/* campo de busca */}
        <div className="shrink-0 px-5 py-4">
          <div className="flex h-[54px] items-center gap-3 border border-white/10 bg-white/[0.08] px-5 transition focus-within:border-white/25 focus-within:bg-white/[0.12]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-white/45"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={config.placeholder}
              className="flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-white/40"
              autoComplete="off"
            />
            {q && (
              <button type="button" aria-label="Limpar" onClick={() => setQ("")} className="grid h-7 w-7 place-items-center bg-white/15 text-white/70 transition hover:bg-white/25 hover:text-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        </div>

        {/* conteúdo */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 sm:max-h-[calc(85vh-200px)]">
          {/* acordeão de filtros */}
          {config.mostrarFiltros && (
          <div className="mb-5">
            <button
              type="button"
              onClick={() => setFiltrosAbertos((v) => !v)}
              className={`flex w-full items-center justify-between border px-5 py-3.5 text-[14px] font-medium transition ${filtrosAbertos ? "border-white/[0.22] bg-white/[0.12] text-white" : "border-white/10 bg-white/[0.06] text-white/75 hover:border-white/20 hover:bg-white/10"}`}
            >
              <span className="flex items-center gap-2.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></svg>
                Filtros avançados
                {ativos > 0 && <span className="px-2.5 py-0.5 text-[11px] font-semibold text-white" style={{ background: PRIMARY }}>{ativos}</span>}
              </span>
              <Chevron className={`text-white/45 transition-transform ${filtrosAbertos ? "rotate-180" : ""}`} />
            </button>

            {filtrosAbertos && (
              <div className="mt-3.5 flex flex-col gap-4 border border-white/[0.08] bg-white/[0.05] p-[18px]">
                <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2">
                  <GlassDropdown label="Tipo" placeholder="Todos" options={dados.tipos} value={tipo} onChange={setTipo} />
                  <GlassDropdown label="Tipologia" placeholder="Todas" options={dados.categorias} value={categoria} onChange={setCategoria} />
                </div>
                <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2">
                  <GlassDropdown label="Cidade" placeholder="Todas" options={dados.cidades} value={cidade} onChange={(v) => { setCidade(v); setBairro(""); }} />
                  <GlassDropdown label="Bairro" placeholder={cidade ? "Todos" : "Selecione a cidade"} options={bairrosCidade} value={bairro} onChange={setBairro} disabled={!cidade} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-white/45">Status</label>
                  <div className="flex flex-wrap gap-2">
                    <Tag ativo={status === ""} onClick={() => setStatus("")}>Todos</Tag>
                    {dados.status.map((s) => (
                      <Tag key={s.slug} ativo={status === s.slug} onClick={() => setStatus(s.slug)}>{s.nome}</Tag>
                    ))}
                  </div>
                </div>
                {(ativos > 0) && (
                  <button type="button" onClick={limparTudo} className="flex items-center justify-center gap-2 border border-dashed border-red-500/45 bg-red-500/10 p-3 text-[13px] font-medium text-red-400 transition hover:border-red-500 hover:bg-red-500/[0.18] hover:text-red-500">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                    Limpar todos os filtros
                  </button>
                )}
              </div>
            )}
          </div>
          )}

          {/* resultados / sugestões */}
          {vista === "suggest" && (
            <div className="flex flex-col gap-6">
              {config.mostrarCidades && dados.cidades.length > 0 && (
                <Secao titulo="Cidades populares" icone={<PinIcon />}>
                  <div className="flex flex-wrap gap-2.5">
                    {dados.cidades.slice(0, config.qtdCidades).map((c) => (
                      <button key={c.slug} type="button" onClick={() => { setCidade(c.slug); setBairro(""); }} className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.06] px-[18px] py-2.5 text-[14px] font-medium text-white/75 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/12 hover:text-white">
                        {c.nome}
                        {c.count != null && <span className="inline-flex h-6 min-w-6 items-center justify-center bg-white/12 px-2 text-[12px] font-semibold text-white/75">{c.count}</span>}
                      </button>
                    ))}
                  </div>
                </Secao>
              )}
              {config.mostrarTipos && dados.tipos.length > 0 && (
                <Secao titulo="Tipos de imóvel" icone={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>}>
                  <div className="flex flex-wrap gap-2.5">
                    {dados.tipos.map((t) => (
                      <button key={t.slug} type="button" onClick={() => setTipo(t.slug)} className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.06] px-[18px] py-2.5 text-[14px] font-medium text-white/75 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/12 hover:text-white">
                        {t.nome}
                      </button>
                    ))}
                  </div>
                </Secao>
              )}
              {config.mostrarRecentes && dados.recentes.length > 0 && (
                <Secao titulo="Adicionados recentemente" icone={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" /></svg>}>
                  <div className="flex flex-col gap-2.5">
                    {dados.recentes.map((it) => <ItemLink key={it.id} it={it} />)}
                  </div>
                </Secao>
              )}
            </div>
          )}

          {vista === "loading" && (
            <Estado>
              <div className="mb-3.5 flex gap-1.5">
                {[0, 1, 2].map((i) => <span key={i} className="h-2.5 w-2.5 rounded-full bg-white/60" style={{ animation: "esg-bounce 1.2s ease-in-out infinite", animationDelay: `${-0.32 + i * 0.16}s` }} />)}
              </div>
              <p className="text-[14px] text-white/45">Buscando...</p>
            </Estado>
          )}

          {vista === "empty" && (
            <Estado>
              <div className="mb-[18px] grid h-[72px] w-[72px] place-items-center bg-white/[0.06] text-white/35">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path d="M9 22V12h6v10" /></svg>
              </div>
              <p className="mb-1.5 text-[16px] font-semibold text-white">Nenhum resultado encontrado</p>
              <p className="text-[14px] text-white/45">Tente outros termos ou filtros</p>
            </Estado>
          )}

          {vista === "error" && (
            <Estado>
              <div className="mb-[18px] grid h-[72px] w-[72px] place-items-center bg-red-500/[0.18] text-red-400">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" /></svg>
              </div>
              <p className="mb-1.5 text-[16px] font-semibold text-white">Erro na busca</p>
              <button type="button" onClick={buscar} className="mt-3.5 px-6 py-2.5 text-[14px] font-semibold text-white transition hover:brightness-110" style={{ background: PRIMARY }}>Tentar novamente</button>
            </Estado>
          )}

          {vista === "list" && (
            <div>
              <div className="mb-3.5 border-b border-white/[0.08] py-3 text-[13px] font-medium text-white/45">
                {total} {total === 1 ? "resultado" : "resultados"}
              </div>
              <div className="flex flex-col gap-3">
                {items.map((it) => <Card key={it.id} it={it} />)}
              </div>
            </div>
          )}
        </div>

        {/* footer */}
        <footer className="shrink-0 border-t border-white/[0.08] bg-white/[0.05] px-5 py-4">
          <button type="button" onClick={buscar} className="flex h-[54px] w-full items-center justify-center gap-2.5 text-[15px] font-semibold text-white transition hover:brightness-110" style={{ background: PRIMARY }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            Buscar
          </button>
        </footer>
      </div>

      <style>{`@keyframes esg-bounce{0%,80%,100%{transform:scale(0);opacity:.4}40%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}

function Tag({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap border px-[18px] py-2.5 text-[13px] font-medium transition ${ativo ? "text-white" : "border-white/10 bg-white/[0.06] text-white/65 hover:border-white/20 hover:bg-white/12 hover:text-white"}`}
      style={ativo ? { background: PRIMARY, borderColor: PRIMARY } : undefined}
    >
      {children}
    </button>
  );
}

function Secao({ titulo, icone, children }: { titulo: string; icone: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-white/45">
        <span className="text-white/65">{icone}</span>{titulo}
      </h3>
      {children}
    </div>
  );
}

function ItemLink({ it }: { it: BuscaItem }) {
  const loc = [it.bairro, it.cidade].filter(Boolean).join(", ");
  return (
    <a href={it.url} className="group flex items-center gap-3.5 border border-white/[0.08] bg-white/[0.05] p-3 transition hover:translate-x-1 hover:border-white/[0.18] hover:bg-white/10">
      {it.img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={it.img} alt="" className="h-[52px] w-[52px] shrink-0 object-cover" />
      ) : (
        <div className="grid h-[52px] w-[52px] shrink-0 place-items-center bg-white/10 text-white/30"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg></div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-[14px] font-semibold text-white">{it.nome}</span>
        {loc && <span className="text-[12px] text-white/45">{loc}</span>}
      </div>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-white/30 transition group-hover:translate-x-1 group-hover:text-white/65"><path d="m9 18 6-6-6-6" /></svg>
    </a>
  );
}

function Card({ it }: { it: BuscaItem }) {
  const loc = [it.bairro, it.cidade].filter(Boolean).join(", ");
  return (
    <a href={it.url} className="group flex gap-3.5 border border-white/[0.08] bg-white/[0.05] p-3.5 transition hover:-translate-y-0.5 hover:border-white/[0.18] hover:bg-white/10">
      {it.img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={it.img} alt="" className="h-20 w-20 shrink-0 object-cover" loading="lazy" />
      ) : (
        <div className="grid h-20 w-20 shrink-0 place-items-center bg-white/10 text-white/30"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg></div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <h3 className="line-clamp-2 text-[14px] font-semibold leading-[1.35] text-white">{it.nome}</h3>
        {loc && <p className="flex items-center gap-1.5 text-[12px] text-white/45"><PinIcon />{loc}</p>}
        <div className="mt-auto flex flex-wrap gap-1.5">
          {it.tipo && <span className="bg-white/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.03em] text-white/75">{it.tipo}</span>}
          {it.status && <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.03em]" style={{ background: "rgba(52,211,153,.22)", color: "#34d399" }}>{it.status}</span>}
        </div>
      </div>
      <span className="flex items-center text-white/30 transition group-hover:translate-x-1 group-hover:text-white/65"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg></span>
    </a>
  );
}

function Estado({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col items-center px-5 py-[50px] text-center">{children}</div>;
}
