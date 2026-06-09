import React, { useState, useMemo } from "react";

// ════════════════════════════════════════════════════════════════════════
// Área Administrativa — Listagem de Empreendimentos.
// App shell com sidebar, filtros, visão grade/lista e ações de gestão.
// ════════════════════════════════════════════════════════════════════════

const LINHAS = [
  { value: "benx_unicos", label: "Benx Únicos", cor: "#7A5C1E", bg: "rgba(122,92,30,0.10)" },
  { value: "benx", label: "Benx", cor: "#0A4DCC", bg: "rgba(10,77,204,0.10)" },
  { value: "vivabenx", label: "VivaBenx", cor: "#2E9E54", bg: "rgba(46,158,84,0.12)" },
];
const STATUS = [
  { value: "lancamento", label: "Lançamento" },
  { value: "em_construcao", label: "Em construção" },
  { value: "pronto_para_morar", label: "Pronto para morar" },
  { value: "entregue", label: "Entregue" },
];
const TIPOS = [{ value: "residencial", label: "Residencial" }, { value: "comercial", label: "Comercial" }];
const ORDENS = [
  { value: "recentes", label: "Atualizados recentemente" },
  { value: "nome", label: "Nome (A-Z)" },
  { value: "unidades", label: "Mais unidades" },
];
const linhaInfo = (v) => LINHAS.find((l) => l.value === v);
const statusLabel = (v) => STATUS.find((s) => s.value === v)?.label ?? "";
const tipoLabel = (v) => TIPOS.find((t) => t.value === v)?.label ?? "";
const fmtData = (s) => { const [y, m, d] = s.split("-"); return `${d}/${m}/${y}`; };

const SEED = [
  { id: "1", slug: "pvn-corporate-boutique", nome: "PVN Corporate Boutique", linha: "benx_unicos", tipo: "comercial", status: "pronto_para_morar", estado: "SP", cidade: "São Paulo", bairro: "Itaim Bibi", metragem: "537 a 1.072 m²", unidades: 68, visivel: true, atualizadoEm: "2026-05-20" },
  { id: "2", slug: "jardins-haus", nome: "Jardins Haus", linha: "benx_unicos", tipo: "residencial", status: "lancamento", estado: "SP", cidade: "São Paulo", bairro: "Jardins", metragem: "180 a 320 m²", unidades: 42, visivel: false, atualizadoEm: "2026-05-28" },
  { id: "3", slug: "vista-pinheiros", nome: "Vista Pinheiros", linha: "benx", tipo: "residencial", status: "em_construcao", estado: "SP", cidade: "São Paulo", bairro: "Pinheiros", metragem: "32 a 58 m²", unidades: 210, visivel: true, atualizadoEm: "2026-04-15" },
  { id: "4", slug: "moema-square", nome: "Moema Square", linha: "benx", tipo: "residencial", status: "em_construcao", estado: "SP", cidade: "São Paulo", bairro: "Moema", metragem: "65 a 98 m²", unidades: 156, visivel: true, atualizadoEm: "2026-03-30" },
  { id: "5", slug: "brooklin-offices", nome: "Brooklin Offices", linha: "benx", tipo: "comercial", status: "entregue", estado: "SP", cidade: "São Paulo", bairro: "Brooklin", metragem: "28 a 140 m²", unidades: 320, visivel: true, atualizadoEm: "2025-11-10" },
  { id: "6", slug: "viva-campinas", nome: "Viva Campinas", linha: "vivabenx", tipo: "residencial", status: "lancamento", estado: "SP", cidade: "Campinas", bairro: "Cambuí", metragem: "38 a 52 m²", unidades: 280, visivel: true, atualizadoEm: "2026-05-12" },
  { id: "7", slug: "viva-guarulhos", nome: "Viva Guarulhos", linha: "vivabenx", tipo: "residencial", status: "em_construcao", estado: "SP", cidade: "Guarulhos", bairro: "Centro", metragem: "40 a 48 m²", unidades: 340, visivel: false, atualizadoEm: "2026-02-20" },
  { id: "8", slug: "leblon-signature", nome: "Leblon Signature", linha: "benx_unicos", tipo: "residencial", status: "lancamento", estado: "RJ", cidade: "Rio de Janeiro", bairro: "Leblon", metragem: "210 a 480 m²", unidades: 24, visivel: false, atualizadoEm: "2026-05-30" },
  { id: "9", slug: "vila-mariana-living", nome: "Vila Mariana Living", linha: "benx", tipo: "residencial", status: "lancamento", estado: "SP", cidade: "São Paulo", bairro: "Vila Mariana", metragem: "55 a 72 m²", unidades: 124, visivel: true, atualizadoEm: "2026-06-01" },
];

const NAV = [
  { id: "dash", label: "Dashboard", icon: "M3 13h8V3H3zM13 21h8V11h-8zM13 3v6h8V3zM3 21h8v-6H3z" },
  { id: "emp", label: "Empreendimentos", icon: "M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M15 9h.01M15 13h.01", ativo: true },
  { id: "plantas", label: "Plantas", icon: "M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2h-4M9 3v18M9 8h12" },
  { id: "midias", label: "Mídias", icon: "M3 3h18v18H3zM3 15l5-5 4 4 3-3 6 6" },
  { id: "leads", label: "Leads", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" },
  { id: "rel", label: "Relatórios", icon: "M3 3v18h18M7 16l4-4 3 3 5-6" },
  { id: "cfg", label: "Configurações", icon: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-2.82 1.17V21a2 2 0 11-4 0v-.09A1.65 1.65 0 007 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 003.6 14a1.65 1.65 0 00-1.51-1H2a2 2 0 110-4h.09A1.65 1.65 0 003.6 8a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 008 3.6a1.65 1.65 0 001-1.51V2a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 8c.36.62 1.02 1 1.74 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" },
];

export default function AdminEmpreendimentos() {
  const [itens, setItens] = useState(SEED);
  const [linha, setLinha] = useState("");
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [tipo, setTipo] = useState("");
  const [status, setStatus] = useState("");
  const [vis, setVis] = useState(""); // "", "publicado", "oculto"
  const [ordem, setOrdem] = useState("recentes");
  const [view, setView] = useState("grade"); // grade | lista
  const [menu, setMenu] = useState(null); // id do card com menu aberto

  const base = useMemo(() => (linha ? itens.filter((e) => e.linha === linha) : itens), [itens, linha]);
  const estadosOpts = useMemo(() => [...new Set(base.map((e) => e.estado))].sort(), [base]);
  const cidadesOpts = useMemo(() => [...new Set(base.filter((e) => !estado || e.estado === estado).map((e) => e.cidade))].sort(), [base, estado]);

  const resultados = useMemo(() => {
    let r = base.filter((e) => {
      if (q && !e.nome.toLowerCase().includes(q.toLowerCase())) return false;
      if (estado && e.estado !== estado) return false;
      if (cidade && e.cidade !== cidade) return false;
      if (tipo && e.tipo !== tipo) return false;
      if (status && e.status !== status) return false;
      if (vis === "publicado" && !e.visivel) return false;
      if (vis === "oculto" && e.visivel) return false;
      return true;
    });
    if (ordem === "nome") r = [...r].sort((a, b) => a.nome.localeCompare(b.nome));
    else if (ordem === "unidades") r = [...r].sort((a, b) => b.unidades - a.unidades);
    else r = [...r].sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
    return r;
  }, [base, q, estado, cidade, tipo, status, vis, ordem]);

  const chips = [
    q && { k: "q", label: `"${q}"`, clear: () => setQ("") },
    estado && { k: "e", label: estado, clear: () => setEstado("") },
    cidade && { k: "c", label: cidade, clear: () => setCidade("") },
    tipo && { k: "t", label: tipoLabel(tipo), clear: () => setTipo("") },
    status && { k: "s", label: statusLabel(status), clear: () => setStatus("") },
    vis && { k: "v", label: vis === "publicado" ? "Publicados" : "Ocultos", clear: () => setVis("") },
  ].filter(Boolean);
  const limpar = () => { setQ(""); setEstado(""); setCidade(""); setTipo(""); setStatus(""); setVis(""); };

  const toggleVis = (id) => { setItens((xs) => xs.map((e) => (e.id === id ? { ...e, visivel: !e.visivel } : e))); setMenu(null); };
  const excluir = (id) => { setItens((xs) => xs.filter((e) => e.id !== id)); setMenu(null); };
  const duplicar = (id) => {
    setItens((xs) => { const o = xs.find((e) => e.id === id); return [{ ...o, id: crypto.randomUUID(), nome: o.nome + " (cópia)", slug: o.slug + "-copia", visivel: false, atualizadoEm: new Date().toISOString().slice(0, 10) }, ...xs]; });
    setMenu(null);
  };

  return (
    <div style={tokens}>
      <style>{CSS}</style>
      <div className="bx-shell" onClick={() => menu && setMenu(null)}>
        {/* Sidebar */}
        <aside className="bx-sidebar">
          <div className="bx-side-brand"><span className="bx-brand">Benx</span><span className="bx-side-tag">Admin</span></div>
          <nav className="bx-nav">
            {NAV.map((n) => (
              <a key={n.id} href={`/admin/${n.id}`} className={`bx-nav-item ${n.ativo ? "is-active" : ""}`}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={n.icon} /></svg>
                {n.label}
              </a>
            ))}
          </nav>
          <div className="bx-side-user">
            <div className="bx-avatar">OC</div>
            <div className="bx-side-user-info"><span className="bx-side-user-name">Olive Comunicação</span><span className="bx-side-user-role">Editor</span></div>
          </div>
        </aside>

        {/* Main */}
        <div className="bx-main">
          <div className="bx-page">
            <div className="bx-page-head">
              <div>
                <h1 className="bx-title">Empreendimentos</h1>
                <p className="bx-sub">{resultados.length} de {itens.length}{linha ? ` · ${linhaInfo(linha).label}` : ""}</p>
              </div>
              <a className="bx-btn-primary" href="/admin/empreendimentos/novo">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                Novo empreendimento
              </a>
            </div>

            {/* Pills vertente */}
            <div className="bx-pills">
              <button className={`bx-pill ${linha === "" ? "is-active" : ""}`} onClick={() => { setLinha(""); }}>Todas</button>
              {LINHAS.map((l) => (
                <button key={l.value} className={`bx-pill ${linha === l.value ? "is-active" : ""}`} onClick={() => { setLinha(l.value); setEstado(""); setCidade(""); }} style={linha === l.value ? { borderColor: l.cor, background: l.bg, color: l.cor } : {}}>
                  <span className="bx-pill-dot" style={{ background: l.cor }} />{l.label}
                </button>
              ))}
            </div>

            {/* Filtros */}
            <div className="bx-filters">
              <div className="bx-search">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome..." />
                {q && <button className="bx-search-x" onClick={() => setQ("")}>×</button>}
              </div>
              <FSelect value={estado} onChange={(v) => { setEstado(v); setCidade(""); }} placeholder="Estado" options={estadosOpts.map((u) => ({ value: u, label: u }))} />
              <FSelect value={cidade} onChange={setCidade} placeholder="Cidade" options={cidadesOpts.map((c) => ({ value: c, label: c }))} />
              <FSelect value={tipo} onChange={setTipo} placeholder="Tipo" options={TIPOS} />
              <FSelect value={status} onChange={setStatus} placeholder="Status obra" options={STATUS} />
              <FSelect value={vis} onChange={setVis} placeholder="Visibilidade" options={[{ value: "publicado", label: "Publicados" }, { value: "oculto", label: "Ocultos" }]} />
              <div className="bx-filters-right">
                <FSelect value={ordem} onChange={setOrdem} options={ORDENS} noPlaceholder />
                <div className="bx-viewtoggle">
                  <button className={view === "grade" ? "is-active" : ""} onClick={() => setView("grade")} title="Grade"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg></button>
                  <button className={view === "lista" ? "is-active" : ""} onClick={() => setView("lista")} title="Lista"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg></button>
                </div>
              </div>
            </div>

            {chips.length > 0 && (
              <div className="bx-chips">
                {chips.map((c) => <button key={c.k} className="bx-chip" onClick={c.clear}>{c.label}<span className="bx-chip-x">×</span></button>)}
                <button className="bx-chip-clear" onClick={limpar}>Limpar filtros</button>
              </div>
            )}

            {/* Resultados */}
            {resultados.length === 0 ? (
              <div className="bx-empty">
                <p className="bx-empty-title">Nenhum empreendimento encontrado</p>
                <p className="bx-empty-sub">Ajuste os filtros para ampliar a busca.</p>
                <button className="bx-empty-btn" onClick={() => { limpar(); setLinha(""); }}>Limpar tudo</button>
              </div>
            ) : view === "grade" ? (
              <div className="bx-grid">
                {resultados.map((e) => <CardAdmin key={e.id} e={e} menu={menu} setMenu={setMenu} onToggleVis={toggleVis} onDup={duplicar} onDel={excluir} />)}
              </div>
            ) : (
              <Tabela itens={resultados} menu={menu} setMenu={setMenu} onToggleVis={toggleVis} onDup={duplicar} onDel={excluir} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CardAdmin({ e, menu, setMenu, onToggleVis, onDup, onDel }) {
  const l = linhaInfo(e.linha);
  return (
    <div className="bx-card">
      <div className="bx-card-img" style={{ background: `linear-gradient(135deg, ${l.bg}, var(--bg-muted))` }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={l.cor} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M15 9h.01M15 13h.01" /></svg>
        <span className="bx-card-status">{statusLabel(e.status)}</span>
        <span className="bx-card-linha" style={{ background: l.cor }}>{l.label}</span>
      </div>
      <div className="bx-card-body">
        <div className="bx-card-titlerow">
          <p className="bx-card-nome">{e.nome}</p>
          <Vis on={e.visivel} />
        </div>
        <p className="bx-card-loc">{e.bairro}, {e.cidade} · {e.estado}</p>
        <div className="bx-card-meta"><span>{e.metragem}</span><span>{e.unidades} un.</span><span>{tipoLabel(e.tipo)}</span></div>
        <p className="bx-card-upd">Atualizado em {fmtData(e.atualizadoEm)}</p>
      </div>
      <div className="bx-card-actions">
        <a className="bx-act" href={`/admin/empreendimentos/${e.slug}`}>Editar</a>
        <a className="bx-act is-ghost" href={`/${e.linha}/${e.slug}`} target="_blank" rel="noreferrer">Ver no site</a>
        <div className="bx-menu-wrap" onClick={(ev) => ev.stopPropagation()}>
          <button className="bx-act is-icon" onClick={() => setMenu(menu === e.id ? null : e.id)}>⋯</button>
          {menu === e.id && (
            <div className="bx-menu">
              <button onClick={() => onToggleVis(e.id)}>{e.visivel ? "Ocultar do site" : "Publicar"}</button>
              <button onClick={() => onDup(e.id)}>Duplicar</button>
              <button className="is-danger" onClick={() => onDel(e.id)}>Excluir</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Tabela({ itens, menu, setMenu, onToggleVis, onDup, onDel }) {
  return (
    <div className="bx-table-wrap">
      <table className="bx-table">
        <thead><tr><th>Empreendimento</th><th>Vertente</th><th>Local</th><th>Status</th><th>Visibilidade</th><th>Atualizado</th><th></th></tr></thead>
        <tbody>
          {itens.map((e) => {
            const l = linhaInfo(e.linha);
            return (
              <tr key={e.id}>
                <td><a className="bx-tlink" href={`/admin/empreendimentos/${e.slug}`}>{e.nome}</a><span className="bx-tmeta">{e.metragem} · {e.unidades} un.</span></td>
                <td><span className="bx-tvert" style={{ color: l.cor }}><span className="bx-pill-dot" style={{ background: l.cor }} />{l.label}</span></td>
                <td>{e.bairro}, {e.cidade}<span className="bx-tmeta">{e.estado}</span></td>
                <td>{statusLabel(e.status)}</td>
                <td><Vis on={e.visivel} /></td>
                <td>{fmtData(e.atualizadoEm)}</td>
                <td className="bx-tactions">
                  <a className="bx-act" href={`/admin/empreendimentos/${e.slug}`}>Editar</a>
                  <div className="bx-menu-wrap" onClick={(ev) => ev.stopPropagation()}>
                    <button className="bx-act is-icon" onClick={() => setMenu(menu === e.id ? null : e.id)}>⋯</button>
                    {menu === e.id && (
                      <div className="bx-menu bx-menu-up">
                        <button onClick={() => onToggleVis(e.id)}>{e.visivel ? "Ocultar do site" : "Publicar"}</button>
                        <a href={`/${e.linha}/${e.slug}`} target="_blank" rel="noreferrer">Ver no site</a>
                        <button onClick={() => onDup(e.id)}>Duplicar</button>
                        <button className="is-danger" onClick={() => onDel(e.id)}>Excluir</button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Vis({ on }) {
  return <span className={`bx-vis ${on ? "is-pub" : "is-hid"}`}><span className="bx-vis-dot" />{on ? "Publicado" : "Oculto"}</span>;
}
function FSelect({ value, onChange, options, placeholder, noPlaceholder }) {
  return (
    <div className={`bx-fselect ${value ? "is-set" : ""}`}>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {!noPlaceholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <svg className="bx-fselect-caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
    </div>
  );
}

const tokens = {
  "--font-display": "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Inter', system-ui, sans-serif",
  "--font-body": "'SF Pro Text', -apple-system, BlinkMacSystemFont, 'SF Pro', 'Inter', system-ui, sans-serif",
  "--bg-canvas": "#FBFBFD", "--bg-surface": "#FFFFFF", "--bg-muted": "#F4F4F6", "--bg-sidebar": "#F7F7F9",
  "--text-primary": "#1A1A1F", "--text-secondary": "#6B6B73", "--text-tertiary": "#9B9BA3",
  "--border-default": "rgba(20,20,30,0.09)", "--border-emphasis": "rgba(20,20,30,0.15)",
  "--accent": "#0A4DCC", "--accent-subtle": "rgba(10,77,204,0.08)",
  "--success": "#2E9E54", "--error": "#E5484D",
  "--shadow-xs": "0 1px 2px rgba(0,0,0,0.04), 0 1px 1px rgba(0,0,0,0.02)",
  "--shadow-md": "0 4px 12px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.03)",
  "--shadow-lg": "0 12px 32px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.04)",
  "--ease": "cubic-bezier(0.25, 1, 0.5, 1)",
};

const CSS = `
.bx-shell{min-height:100vh;display:flex;background:var(--bg-canvas);color:var(--text-primary);font-family:var(--font-body);font-size:14px;-webkit-font-smoothing:antialiased;letter-spacing:-0.003em}
.bx-sidebar{position:sticky;top:0;height:100vh;width:236px;flex-shrink:0;background:var(--bg-sidebar);border-right:1px solid var(--border-default);display:flex;flex-direction:column;padding:16px 12px}
.bx-side-brand{display:flex;align-items:center;gap:8px;padding:6px 10px 18px}
.bx-brand{font-family:var(--font-display);font-size:16px;font-weight:700;letter-spacing:-0.02em}
.bx-side-tag{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--text-tertiary);background:var(--bg-muted);padding:2px 6px;border-radius:5px}
.bx-nav{display:flex;flex-direction:column;gap:2px;flex:1}
.bx-nav-item{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;font-size:13px;font-weight:500;color:var(--text-secondary);text-decoration:none;transition:background .12s var(--ease),color .12s var(--ease)}
.bx-nav-item:hover{background:rgba(20,20,30,0.04);color:var(--text-primary)}
.bx-nav-item.is-active{background:var(--bg-surface);color:var(--text-primary);box-shadow:var(--shadow-xs);font-weight:600}
.bx-nav-item.is-active svg{color:var(--accent)}
.bx-side-user{display:flex;align-items:center;gap:10px;padding:10px;border-top:1px solid var(--border-default);margin-top:8px}
.bx-avatar{width:30px;height:30px;border-radius:8px;background:var(--accent);color:#fff;display:grid;place-items:center;font-size:11px;font-weight:700}
.bx-side-user-info{display:flex;flex-direction:column;min-width:0}
.bx-side-user-name{font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bx-side-user-role{font-size:11px;color:var(--text-tertiary)}
.bx-main{flex:1;min-width:0}
.bx-page{max-width:1100px;margin:0 auto;padding:28px}
.bx-page-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:18px}
.bx-title{font-family:var(--font-display);font-size:25px;font-weight:600;letter-spacing:-0.02em;margin:0}
.bx-sub{font-size:13px;color:var(--text-secondary);margin:5px 0 0;font-variant-numeric:tabular-nums}
.bx-btn-primary{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:500;color:#fff;background:var(--text-primary);border:none;border-radius:9px;padding:9px 15px;text-decoration:none;cursor:pointer;transition:opacity .15s var(--ease);white-space:nowrap}
.bx-btn-primary:hover{opacity:.9}
.bx-pills{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
.bx-pill{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:500;color:var(--text-secondary);background:var(--bg-surface);border:1px solid var(--border-default);border-radius:9999px;padding:6px 13px;cursor:pointer;transition:all .15s var(--ease)}
.bx-pill:hover{border-color:var(--border-emphasis);color:var(--text-primary)}
.bx-pill.is-active{color:var(--text-primary);font-weight:600;border-color:var(--text-primary)}
.bx-pill-dot{width:7px;height:7px;border-radius:9999px}
.bx-filters{display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding:12px;background:var(--bg-surface);border:1px solid var(--border-default);border-radius:12px;box-shadow:var(--shadow-xs)}
.bx-search{position:relative;display:flex;align-items:center;flex:1;min-width:180px}
.bx-search svg{position:absolute;left:11px;color:var(--text-tertiary);pointer-events:none}
.bx-search input{width:100%;border:1px solid var(--border-default);background:var(--bg-canvas);border-radius:9px;padding:8px 30px 8px 32px;font-size:13px;font-family:inherit;color:var(--text-primary);outline:none;transition:border-color .15s var(--ease),box-shadow .15s var(--ease)}
.bx-search input::placeholder{color:var(--text-tertiary)}
.bx-search input:focus-visible{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-subtle)}
.bx-search-x{position:absolute;right:8px;border:none;background:none;color:var(--text-tertiary);font-size:16px;cursor:pointer}
.bx-fselect{position:relative}
.bx-fselect select{appearance:none;border:1px solid var(--border-default);background:var(--bg-canvas);border-radius:9px;padding:8px 28px 8px 11px;font-size:13px;font-family:inherit;color:var(--text-secondary);cursor:pointer;outline:none;transition:border-color .15s var(--ease),box-shadow .15s var(--ease)}
.bx-fselect.is-set select{color:var(--text-primary);font-weight:500;border-color:var(--border-emphasis)}
.bx-fselect select:focus-visible{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-subtle)}
.bx-fselect-caret{position:absolute;right:9px;top:50%;transform:translateY(-50%);color:var(--text-tertiary);pointer-events:none}
.bx-filters-right{display:flex;align-items:center;gap:8px;margin-left:auto}
.bx-viewtoggle{display:flex;border:1px solid var(--border-default);border-radius:9px;overflow:hidden;background:var(--bg-canvas)}
.bx-viewtoggle button{display:grid;place-items:center;width:34px;height:34px;border:none;background:none;color:var(--text-tertiary);cursor:pointer;transition:background .12s var(--ease),color .12s var(--ease)}
.bx-viewtoggle button.is-active{background:var(--bg-surface);color:var(--text-primary);box-shadow:var(--shadow-xs)}
.bx-chips{display:flex;gap:7px;flex-wrap:wrap;align-items:center;margin-top:12px}
.bx-chip{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:500;color:var(--text-primary);background:var(--bg-surface);border:1px solid var(--border-emphasis);border-radius:9999px;padding:4px 6px 4px 11px;cursor:pointer;transition:background .15s var(--ease)}
.bx-chip:hover{background:var(--bg-muted)}
.bx-chip-x{display:grid;place-items:center;width:15px;height:15px;border-radius:9999px;background:var(--bg-muted);font-size:12px}
.bx-chip-clear{font-size:12px;color:var(--accent);background:none;border:none;cursor:pointer;padding:4px 6px;font-weight:500}
.bx-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:20px}
.bx-card{display:flex;flex-direction:column;background:var(--bg-surface);border:1px solid var(--border-default);border-radius:14px;overflow:hidden;box-shadow:var(--shadow-xs);transition:box-shadow .18s var(--ease),border-color .18s var(--ease)}
.bx-card:hover{box-shadow:var(--shadow-md);border-color:var(--border-emphasis)}
.bx-card-img{position:relative;height:130px;display:grid;place-items:center}
.bx-card-status{position:absolute;top:10px;left:10px;padding:3px 8px;font-size:10px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#fff;background:rgba(0,0,0,.55);border-radius:6px;backdrop-filter:blur(4px)}
.bx-card-linha{position:absolute;top:10px;right:10px;padding:3px 8px;font-size:10px;font-weight:600;color:#fff;border-radius:6px}
.bx-card-body{padding:14px 16px 12px;flex:1}
.bx-card-titlerow{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
.bx-card-nome{font-family:var(--font-display);font-size:15px;font-weight:600;letter-spacing:-0.012em;margin:0}
.bx-card-loc{font-size:12px;color:var(--text-tertiary);margin:7px 0 0}
.bx-card-meta{display:flex;flex-wrap:wrap;gap:12px;margin-top:9px;padding-top:9px;border-top:1px solid var(--border-default);font-size:12px;color:var(--text-secondary);font-variant-numeric:tabular-nums}
.bx-card-upd{font-size:11px;color:var(--text-tertiary);margin:9px 0 0}
.bx-card-actions{display:flex;align-items:center;gap:6px;padding:10px 14px;border-top:1px solid var(--border-default);background:var(--bg-canvas)}
.bx-act{font-size:12px;font-weight:500;color:var(--text-primary);text-decoration:none;padding:6px 11px;border:1px solid var(--border-default);border-radius:8px;background:var(--bg-surface);cursor:pointer;transition:background .12s var(--ease)}
.bx-act:hover{background:var(--bg-muted)}
.bx-act.is-ghost{border-color:transparent;background:none;color:var(--text-secondary)}
.bx-act.is-ghost:hover{color:var(--text-primary);background:var(--bg-muted)}
.bx-act.is-icon{margin-left:auto;padding:6px 10px;font-size:15px;line-height:1;color:var(--text-secondary)}
.bx-menu-wrap{position:relative}
.bx-menu{position:absolute;right:0;top:calc(100% + 4px);z-index:20;background:var(--bg-surface);border:1px solid var(--border-default);border-radius:10px;box-shadow:var(--shadow-lg);padding:4px;min-width:160px;animation:bxpop .12s var(--ease)}
.bx-menu.bx-menu-up{top:auto;bottom:calc(100% + 4px)}
.bx-menu button,.bx-menu a{display:block;width:100%;text-align:left;padding:7px 10px;border:none;background:none;border-radius:7px;font-size:13px;font-family:inherit;color:var(--text-primary);cursor:pointer;text-decoration:none;transition:background .1s var(--ease)}
.bx-menu button:hover,.bx-menu a:hover{background:var(--bg-muted)}
.bx-menu .is-danger{color:var(--error)}
@keyframes bxpop{from{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:translateY(0)}}
.bx-vis{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;padding:2px 8px;border-radius:9999px;white-space:nowrap}
.bx-vis-dot{width:6px;height:6px;border-radius:9999px}
.bx-vis.is-pub{color:var(--success);background:rgba(46,158,84,0.10)}
.bx-vis.is-pub .bx-vis-dot{background:var(--success)}
.bx-vis.is-hid{color:var(--text-tertiary);background:var(--bg-muted)}
.bx-vis.is-hid .bx-vis-dot{background:var(--text-tertiary)}
.bx-table-wrap{margin-top:20px;background:var(--bg-surface);border:1px solid var(--border-default);border-radius:12px;overflow:visible;box-shadow:var(--shadow-xs)}
.bx-table{width:100%;border-collapse:collapse;font-size:13px}
.bx-table thead th{text-align:left;font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-tertiary);padding:11px 16px;border-bottom:1px solid var(--border-default)}
.bx-table tbody td{padding:12px 16px;border-bottom:1px solid var(--border-default);vertical-align:middle;color:var(--text-secondary)}
.bx-table tbody tr:last-child td{border-bottom:none}
.bx-table tbody tr:hover{background:var(--bg-canvas)}
.bx-tlink{font-weight:600;color:var(--text-primary);text-decoration:none;display:block}
.bx-tlink:hover{color:var(--accent)}
.bx-tmeta{display:block;font-size:11px;color:var(--text-tertiary);margin-top:2px}
.bx-tvert{display:inline-flex;align-items:center;gap:6px;font-weight:600}
.bx-tactions{display:flex;align-items:center;gap:6px;justify-content:flex-end}
.bx-empty{text-align:center;padding:64px 24px;border:1px dashed var(--border-emphasis);border-radius:14px;margin-top:20px}
.bx-empty-title{font-size:15px;font-weight:600;margin:0}
.bx-empty-sub{font-size:13px;color:var(--text-tertiary);margin:5px 0 16px}
.bx-empty-btn{font-size:13px;font-weight:500;color:#fff;background:var(--text-primary);border:none;border-radius:9px;padding:8px 16px;cursor:pointer}
@media(max-width:1000px){.bx-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:820px){.bx-sidebar{display:none}.bx-page{padding:20px}}
@media(max-width:620px){.bx-grid{grid-template-columns:1fr}.bx-filters-right{margin-left:0;width:100%;justify-content:space-between}.bx-search{min-width:100%}.bx-table-wrap{overflow-x:auto}.bx-table{min-width:680px}}
@media(prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
`;
