import React, { useState, useMemo } from "react";

// ════════════════════════════════════════════════════════════════════════
// Área Administrativa Benx — Dashboard, Mídias e Leads.
// App shell com sidebar navegável. Mesmo sistema de tokens (Premium Web).
// ════════════════════════════════════════════════════════════════════════

const LINHAS = [
  { value: "benx_unicos", label: "Benx Únicos", cor: "#7A5C1E", bg: "rgba(122,92,30,0.10)" },
  { value: "benx", label: "Benx", cor: "#0A4DCC", bg: "rgba(10,77,204,0.10)" },
  { value: "vivabenx", label: "VivaBenx", cor: "#2E9E54", bg: "rgba(46,158,84,0.12)" },
];
const linhaInfo = (v) => LINHAS.find((l) => l.value === v);

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "M3 13h8V3H3zM13 21h8V11h-8zM13 3v6h8V3zM3 21h8v-6H3z" },
  { id: "emp", label: "Empreendimentos", icon: "M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M15 9h.01M15 13h.01" },
  { id: "plantas", label: "Plantas", icon: "M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2h-4M9 3v18M9 8h12" },
  { id: "midias", label: "Mídias", icon: "M3 3h18v18H3zM3 15l5-5 4 4 3-3 6 6" },
  { id: "leads", label: "Leads", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z" },
  { id: "rel", label: "Relatórios", icon: "M3 3v18h18M7 16l4-4 3 3 5-6" },
  { id: "cfg", label: "Configurações", icon: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-2.82 1.17V21a2 2 0 11-4 0v-.09A1.65 1.65 0 007 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 003.6 14a1.65 1.65 0 00-1.51-1H2a2 2 0 110-4h.09A1.65 1.65 0 003.6 8a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 008 3.6a1.65 1.65 0 001-1.51V2a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 8c.36.62 1.02 1 1.74 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" },
];

export default function AdminPainel() {
  const [pagina, setPagina] = useState("dashboard");
  const ativa = NAV.find((n) => n.id === pagina);
  return (
    <div style={tokens}>
      <style>{CSS}</style>
      <div className="bx-shell">
        <aside className="bx-sidebar">
          <div className="bx-side-brand"><span className="bx-brand">Benx</span><span className="bx-side-tag">Admin</span></div>
          <nav className="bx-nav">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => setPagina(n.id)} className={`bx-nav-item ${pagina === n.id ? "is-active" : ""}`}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={n.icon} /></svg>
                {n.label}
              </button>
            ))}
          </nav>
          <div className="bx-side-user"><div className="bx-avatar">OC</div><div className="bx-side-user-info"><span className="bx-side-user-name">Olive Comunicação</span><span className="bx-side-user-role">Editor</span></div></div>
        </aside>
        <div className="bx-main">
          <div className="bx-page">
            {pagina === "dashboard" && <Dashboard />}
            {pagina === "midias" && <Midias />}
            {pagina === "leads" && <Leads />}
            {!["dashboard", "midias", "leads"].includes(pagina) && <EmBreve titulo={ativa.label} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────── DASHBOARD ────────────────────────────────
const KPIS = [
  { label: "Empreendimentos ativos", valor: "9", delta: "+2", up: true },
  { label: "Publicados no site", valor: "6", delta: "+1", up: true },
  { label: "Leads no mês", valor: "142", delta: "+18%", up: true },
  { label: "Em obras", valor: "3", delta: "0", up: null },
];
const LEADS_MES = [{ m: "Jan", v: 84 }, { m: "Fev", v: 96 }, { m: "Mar", v: 110 }, { m: "Abr", v: 102 }, { m: "Mai", v: 128 }, { m: "Jun", v: 142 }];
const POR_VERTENTE = [{ linha: "benx_unicos", n: 2 }, { linha: "benx", n: 4 }, { linha: "vivabenx", n: 3 }];
const ATIVIDADE = [
  { quem: "Você", acao: "publicou", alvo: "Vila Mariana Living", quando: "há 2h" },
  { quem: "Você", acao: "editou plantas de", alvo: "Vista Pinheiros", quando: "há 5h" },
  { quem: "Sistema", acao: "recebeu 3 leads em", alvo: "Viva Campinas", quando: "ontem" },
  { quem: "Você", acao: "criou", alvo: "Leblon Signature", quando: "há 2 dias" },
];

function Dashboard() {
  const maxLead = Math.max(...LEADS_MES.map((d) => d.v));
  const totalVert = POR_VERTENTE.reduce((s, d) => s + d.n, 0);
  return (
    <>
      <div className="bx-page-head"><div><h1 className="bx-title">Dashboard</h1><p className="bx-sub">Visão geral do portfólio e da captação</p></div></div>
      <div className="bx-kpis">
        {KPIS.map((k) => (
          <div key={k.label} className="bx-kpi">
            <span className="bx-kpi-label">{k.label}</span>
            <div className="bx-kpi-row"><span className="bx-kpi-valor">{k.valor}</span>{k.delta !== "0" && <span className={`bx-kpi-delta ${k.up ? "is-up" : "is-down"}`}>{k.delta}</span>}</div>
          </div>
        ))}
      </div>
      <div className="bx-dash-grid">
        <div className="bx-panel">
          <div className="bx-panel-head"><span className="bx-panel-title">Leads por mês</span><span className="bx-panel-tag">últimos 6 meses</span></div>
          <div className="bx-bars">
            {LEADS_MES.map((d) => (
              <div key={d.m} className="bx-bar-col">
                <div className="bx-bar-track"><div className="bx-bar-fill" style={{ height: `${(d.v / maxLead) * 100}%` }}><span className="bx-bar-val">{d.v}</span></div></div>
                <span className="bx-bar-label">{d.m}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bx-panel">
          <div className="bx-panel-head"><span className="bx-panel-title">Por vertente</span></div>
          <div className="bx-vstack">
            {POR_VERTENTE.map((d) => { const l = linhaInfo(d.linha); return (
              <div key={d.linha} className="bx-vrow">
                <div className="bx-vrow-top"><span className="bx-vrow-name"><span className="bx-pill-dot" style={{ background: l.cor }} />{l.label}</span><span className="bx-vrow-n">{d.n}</span></div>
                <div className="bx-vtrack"><div className="bx-vfill" style={{ width: `${(d.n / totalVert) * 100}%`, background: l.cor }} /></div>
              </div>
            ); })}
          </div>
        </div>
      </div>
      <div className="bx-panel" style={{ marginTop: 16 }}>
        <div className="bx-panel-head"><span className="bx-panel-title">Atividade recente</span></div>
        <div className="bx-feed">
          {ATIVIDADE.map((a, i) => (
            <div key={i} className="bx-feed-item">
              <span className="bx-feed-dot" />
              <span className="bx-feed-txt"><strong>{a.quem}</strong> {a.acao} <strong>{a.alvo}</strong></span>
              <span className="bx-feed-when">{a.quando}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ───────────────────────────── MÍDIAS ───────────────────────────────────
const TIPOS_MIDIA = [
  { value: "fachada", label: "Fachada" }, { value: "area", label: "Área comum" },
  { value: "planta", label: "Planta" }, { value: "obra", label: "Obra" }, { value: "logo", label: "Logotipo" },
];
const EMPS = ["PVN Corporate Boutique", "Vista Pinheiros", "Moema Square", "Viva Campinas", "Leblon Signature"];
const MIDIAS = Array.from({ length: 18 }).map((_, i) => {
  const tipos = ["fachada", "area", "planta", "obra", "logo"];
  const t = tipos[i % 5];
  return { id: String(i + 1), nome: `${t}-${String(i + 1).padStart(2, "0")}.jpg`, tipo: t, emp: EMPS[i % EMPS.length], tam: `${(0.4 + (i % 5) * 0.3).toFixed(1)} MB`, linha: LINHAS[i % 3].value };
});

function Midias() {
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("");
  const [emp, setEmp] = useState("");
  const res = useMemo(() => MIDIAS.filter((m) => (!q || m.nome.includes(q)) && (!tipo || m.tipo === tipo) && (!emp || m.emp === emp)), [q, tipo, emp]);
  return (
    <>
      <div className="bx-page-head">
        <div><h1 className="bx-title">Mídias</h1><p className="bx-sub">{res.length} arquivos na biblioteca</p></div>
        <button className="bx-btn-primary"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>Enviar mídia</button>
      </div>
      <div className="bx-filters">
        <div className="bx-search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar arquivo..." />
          {q && <button className="bx-search-x" onClick={() => setQ("")}>×</button>}
        </div>
        <FSelect value={tipo} onChange={setTipo} placeholder="Tipo" options={TIPOS_MIDIA} />
        <FSelect value={emp} onChange={setEmp} placeholder="Empreendimento" options={EMPS.map((e) => ({ value: e, label: e }))} />
      </div>
      {res.length === 0 ? <div className="bx-empty"><p className="bx-empty-title">Nenhuma mídia encontrada</p></div> : (
        <div className="bx-media-grid">
          {res.map((m) => { const l = linhaInfo(m.linha); return (
            <div key={m.id} className="bx-media">
              <div className="bx-media-thumb" style={{ background: `linear-gradient(135deg, ${l.bg}, var(--bg-muted))` }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={l.cor} strokeWidth="1.3" opacity="0.55"><rect x="3" y="3" width="18" height="18" rx="2.5" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                <span className="bx-media-tipo">{TIPOS_MIDIA.find((t) => t.value === m.tipo)?.label}</span>
                <div className="bx-media-over"><button className="bx-up-btn">Copiar URL</button><button className="bx-up-btn is-del">Excluir</button></div>
              </div>
              <div className="bx-media-info"><span className="bx-media-nome">{m.nome}</span><span className="bx-media-meta">{m.emp} · {m.tam}</span></div>
            </div>
          ); })}
        </div>
      )}
    </>
  );
}

// ───────────────────────────── LEADS ────────────────────────────────────
const FUNIL = [
  { value: "novo", label: "Novo", cor: "#0A4DCC" },
  { value: "em_contato", label: "Em contato", cor: "#B7791F" },
  { value: "qualificado", label: "Qualificado", cor: "#7A5C1E" },
  { value: "convertido", label: "Convertido", cor: "#2E9E54" },
  { value: "perdido", label: "Perdido", cor: "#9B9BA3" },
];
const ORIGENS = [{ value: "site", label: "Site" }, { value: "whatsapp", label: "WhatsApp" }, { value: "anuncio", label: "Anúncio" }, { value: "indicacao", label: "Indicação" }];
const funilInfo = (v) => FUNIL.find((f) => f.value === v);
const origemLabel = (v) => ORIGENS.find((o) => o.value === v)?.label ?? v;
const LEADS_SEED = [
  { id: "1", nome: "Marina Souza", contato: "(11) 99812-3344", emp: "PVN Corporate Boutique", origem: "site", status: "novo", data: "2026-06-02" },
  { id: "2", nome: "Carlos Eduardo Lima", contato: "(11) 99654-2211", emp: "Vista Pinheiros", origem: "whatsapp", status: "em_contato", data: "2026-06-01" },
  { id: "3", nome: "Fernanda Alves", contato: "(19) 99777-1020", emp: "Viva Campinas", origem: "anuncio", status: "qualificado", data: "2026-05-30" },
  { id: "4", nome: "Roberto Tanaka", contato: "(11) 98123-4567", emp: "Moema Square", origem: "site", status: "convertido", data: "2026-05-28" },
  { id: "5", nome: "Juliana Pires", contato: "(21) 99888-7766", emp: "Leblon Signature", origem: "indicacao", status: "novo", data: "2026-05-27" },
  { id: "6", nome: "AndréMendes", contato: "(11) 99222-3311", emp: "Brooklin Offices", origem: "whatsapp", status: "perdido", data: "2026-05-25" },
  { id: "7", nome: "Patrícia Gomes", contato: "(11) 99001-2233", emp: "Vila Mariana Living", origem: "site", status: "em_contato", data: "2026-05-24" },
];

function Leads() {
  const [leads, setLeads] = useState(LEADS_SEED);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [origem, setOrigem] = useState("");
  const [menu, setMenu] = useState(null);
  const res = useMemo(() => leads.filter((l) => (!q || l.nome.toLowerCase().includes(q.toLowerCase())) && (!status || l.status === status) && (!origem || l.origem === origem)), [leads, q, status, origem]);
  const cont = (s) => leads.filter((l) => l.status === s).length;
  const mudarStatus = (id, novo) => { setLeads((xs) => xs.map((l) => (l.id === id ? { ...l, status: novo } : l))); setMenu(null); };

  return (
    <div onClick={() => menu && setMenu(null)}>
      <div className="bx-page-head"><div><h1 className="bx-title">Leads</h1><p className="bx-sub">{res.length} de {leads.length} contatos</p></div></div>
      <div className="bx-kpis bx-kpis-4">
        <div className="bx-kpi"><span className="bx-kpi-label">Novos</span><span className="bx-kpi-valor">{cont("novo")}</span></div>
        <div className="bx-kpi"><span className="bx-kpi-label">Em contato</span><span className="bx-kpi-valor">{cont("em_contato")}</span></div>
        <div className="bx-kpi"><span className="bx-kpi-label">Qualificados</span><span className="bx-kpi-valor">{cont("qualificado")}</span></div>
        <div className="bx-kpi"><span className="bx-kpi-label">Convertidos</span><span className="bx-kpi-valor">{cont("convertido")}</span></div>
      </div>
      <div className="bx-filters">
        <div className="bx-search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome..." />
          {q && <button className="bx-search-x" onClick={() => setQ("")}>×</button>}
        </div>
        <FSelect value={status} onChange={setStatus} placeholder="Status" options={FUNIL} />
        <FSelect value={origem} onChange={setOrigem} placeholder="Origem" options={ORIGENS} />
      </div>
      {res.length === 0 ? <div className="bx-empty"><p className="bx-empty-title">Nenhum lead encontrado</p></div> : (
        <div className="bx-table-wrap">
          <table className="bx-table">
            <thead><tr><th>Contato</th><th>Interesse</th><th>Origem</th><th>Status</th><th>Data</th><th></th></tr></thead>
            <tbody>
              {res.map((l) => { const f = funilInfo(l.status); return (
                <tr key={l.id}>
                  <td><span className="bx-tlink">{l.nome}</span><span className="bx-tmeta">{l.contato}</span></td>
                  <td>{l.emp}</td>
                  <td>{origemLabel(l.origem)}</td>
                  <td><span className="bx-funil" style={{ color: f.cor, background: `${f.cor}1a` }}><span className="bx-vis-dot" style={{ background: f.cor }} />{f.label}</span></td>
                  <td>{l.data.split("-").reverse().join("/")}</td>
                  <td className="bx-tactions">
                    <div className="bx-menu-wrap" onClick={(ev) => ev.stopPropagation()}>
                      <button className="bx-act is-icon" onClick={() => setMenu(menu === l.id ? null : l.id)}>⋯</button>
                      {menu === l.id && (
                        <div className="bx-menu bx-menu-up">
                          <span className="bx-menu-h">Mover para</span>
                          {FUNIL.filter((s) => s.value !== l.status).map((s) => <button key={s.value} onClick={() => mudarStatus(l.id, s.value)}>{s.label}</button>)}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ); })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EmBreve({ titulo }) {
  return (
    <>
      <div className="bx-page-head"><div><h1 className="bx-title">{titulo}</h1><p className="bx-sub">Seção do painel</p></div></div>
      <div className="bx-empty"><p className="bx-empty-title">{titulo} em breve</p><p className="bx-empty-sub">Esta seção será construída na sequência.</p></div>
    </>
  );
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
  "--accent": "#0A4DCC", "--accent-subtle": "rgba(10,77,204,0.08)", "--success": "#2E9E54", "--error": "#E5484D",
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
.bx-nav-item{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;font-size:13px;font-weight:500;color:var(--text-secondary);background:none;border:none;cursor:pointer;text-align:left;font-family:inherit;transition:background .12s var(--ease),color .12s var(--ease)}
.bx-nav-item:hover{background:rgba(20,20,30,0.04);color:var(--text-primary)}
.bx-nav-item.is-active{background:var(--bg-surface);color:var(--text-primary);box-shadow:var(--shadow-xs);font-weight:600}
.bx-nav-item.is-active svg{color:var(--accent)}
.bx-side-user{display:flex;align-items:center;gap:10px;padding:10px;border-top:1px solid var(--border-default);margin-top:8px}
.bx-avatar{width:30px;height:30px;border-radius:8px;background:var(--accent);color:#fff;display:grid;place-items:center;font-size:11px;font-weight:700}
.bx-side-user-info{display:flex;flex-direction:column;min-width:0}
.bx-side-user-name{font-size:12px;font-weight:600}
.bx-side-user-role{font-size:11px;color:var(--text-tertiary)}
.bx-main{flex:1;min-width:0}
.bx-page{max-width:1100px;margin:0 auto;padding:28px}
.bx-page-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:20px}
.bx-title{font-family:var(--font-display);font-size:25px;font-weight:600;letter-spacing:-0.02em;margin:0}
.bx-sub{font-size:13px;color:var(--text-secondary);margin:5px 0 0;font-variant-numeric:tabular-nums}
.bx-btn-primary{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:500;color:#fff;background:var(--text-primary);border:none;border-radius:9px;padding:9px 15px;cursor:pointer;font-family:inherit;transition:opacity .15s var(--ease);white-space:nowrap}
.bx-btn-primary:hover{opacity:.9}
.bx-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:16px}
.bx-kpi{background:var(--bg-surface);border:1px solid var(--border-default);border-radius:12px;padding:16px;box-shadow:var(--shadow-xs)}
.bx-kpi-label{font-size:12px;color:var(--text-secondary)}
.bx-kpi-row{display:flex;align-items:baseline;gap:8px;margin-top:8px}
.bx-kpi-valor{font-family:var(--font-display);font-size:26px;font-weight:600;letter-spacing:-0.02em;font-variant-numeric:tabular-nums}
.bx-kpi-delta{font-size:12px;font-weight:600;padding:2px 6px;border-radius:6px}
.bx-kpi-delta.is-up{color:var(--success);background:rgba(46,158,84,0.10)}
.bx-kpi-delta.is-down{color:var(--error);background:rgba(229,72,77,0.10)}
.bx-dash-grid{display:grid;grid-template-columns:1.6fr 1fr;gap:16px}
.bx-panel{background:var(--bg-surface);border:1px solid var(--border-default);border-radius:14px;padding:18px;box-shadow:var(--shadow-xs)}
.bx-panel-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.bx-panel-title{font-size:14px;font-weight:600}
.bx-panel-tag{font-size:11px;color:var(--text-tertiary)}
.bx-bars{display:flex;align-items:flex-end;gap:10px;height:160px}
.bx-bar-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;height:100%}
.bx-bar-track{flex:1;width:100%;display:flex;align-items:flex-end}
.bx-bar-fill{width:100%;background:linear-gradient(180deg,var(--accent),rgba(10,77,204,0.55));border-radius:6px 6px 0 0;position:relative;min-height:8px;transition:height .4s var(--ease)}
.bx-bar-val{position:absolute;top:-18px;left:0;right:0;text-align:center;font-size:11px;font-weight:600;color:var(--text-secondary);font-variant-numeric:tabular-nums}
.bx-bar-label{font-size:11px;color:var(--text-tertiary)}
.bx-vstack{display:flex;flex-direction:column;gap:14px}
.bx-vrow-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
.bx-vrow-name{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:500}
.bx-vrow-n{font-size:13px;font-weight:600;font-variant-numeric:tabular-nums}
.bx-pill-dot{width:7px;height:7px;border-radius:9999px}
.bx-vtrack{height:8px;background:var(--bg-muted);border-radius:9999px;overflow:hidden}
.bx-vfill{height:100%;border-radius:9999px;transition:width .4s var(--ease)}
.bx-feed{display:flex;flex-direction:column}
.bx-feed-item{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border-default);font-size:13px}
.bx-feed-item:last-child{border-bottom:none}
.bx-feed-dot{width:7px;height:7px;border-radius:9999px;background:var(--accent);flex-shrink:0}
.bx-feed-txt{color:var(--text-secondary)}
.bx-feed-txt strong{color:var(--text-primary);font-weight:600}
.bx-feed-when{margin-left:auto;font-size:12px;color:var(--text-tertiary);white-space:nowrap}
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
.bx-media-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px;margin-top:20px}
.bx-media{background:var(--bg-surface);border:1px solid var(--border-default);border-radius:12px;overflow:hidden;box-shadow:var(--shadow-xs);transition:box-shadow .15s var(--ease),border-color .15s var(--ease)}
.bx-media:hover{box-shadow:var(--shadow-md);border-color:var(--border-emphasis)}
.bx-media-thumb{position:relative;aspect-ratio:4/3;display:grid;place-items:center}
.bx-media-tipo{position:absolute;top:8px;left:8px;font-size:10px;font-weight:600;color:#fff;background:rgba(0,0,0,.5);padding:2px 7px;border-radius:5px;backdrop-filter:blur(4px)}
.bx-media-over{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:6px;background:rgba(0,0,0,.35);opacity:0;transition:opacity .15s var(--ease)}
.bx-media:hover .bx-media-over{opacity:1}
.bx-up-btn{background:rgba(255,255,255,.92);border:none;border-radius:7px;padding:5px 9px;font-size:11px;font-weight:500;font-family:inherit;color:#1a1a1f;cursor:pointer}
.bx-up-btn.is-del{color:var(--error)}
.bx-media-info{padding:9px 11px}
.bx-media-nome{display:block;font-size:12px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bx-media-meta{display:block;font-size:11px;color:var(--text-tertiary);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bx-kpis-4{grid-template-columns:repeat(4,1fr)}
.bx-table-wrap{margin-top:20px;background:var(--bg-surface);border:1px solid var(--border-default);border-radius:12px;box-shadow:var(--shadow-xs)}
.bx-table{width:100%;border-collapse:collapse;font-size:13px}
.bx-table thead th{text-align:left;font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-tertiary);padding:11px 16px;border-bottom:1px solid var(--border-default)}
.bx-table tbody td{padding:12px 16px;border-bottom:1px solid var(--border-default);vertical-align:middle;color:var(--text-secondary)}
.bx-table tbody tr:last-child td{border-bottom:none}
.bx-table tbody tr:hover{background:var(--bg-canvas)}
.bx-tlink{font-weight:600;color:var(--text-primary);display:block}
.bx-tmeta{display:block;font-size:11px;color:var(--text-tertiary);margin-top:2px}
.bx-tactions{text-align:right}
.bx-act.is-icon{padding:6px 10px;font-size:15px;line-height:1;color:var(--text-secondary);background:none;border:1px solid transparent;border-radius:8px;cursor:pointer}
.bx-act.is-icon:hover{background:var(--bg-muted)}
.bx-menu-wrap{position:relative;display:inline-block}
.bx-menu{position:absolute;right:0;top:calc(100% + 4px);z-index:20;background:var(--bg-surface);border:1px solid var(--border-default);border-radius:10px;box-shadow:var(--shadow-lg);padding:4px;min-width:150px;animation:bxpop .12s var(--ease)}
.bx-menu.bx-menu-up{top:auto;bottom:calc(100% + 4px)}
.bx-menu-h{display:block;font-size:10px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:var(--text-tertiary);padding:6px 10px 4px}
.bx-menu button{display:block;width:100%;text-align:left;padding:7px 10px;border:none;background:none;border-radius:7px;font-size:13px;font-family:inherit;color:var(--text-primary);cursor:pointer}
.bx-menu button:hover{background:var(--bg-muted)}
.bx-funil{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;padding:3px 9px;border-radius:9999px}
.bx-vis-dot{width:6px;height:6px;border-radius:9999px}
.bx-empty{text-align:center;padding:56px 24px;border:1px dashed var(--border-emphasis);border-radius:14px;margin-top:20px}
.bx-empty-title{font-size:15px;font-weight:600;margin:0}
.bx-empty-sub{font-size:13px;color:var(--text-tertiary);margin:5px 0 0}
@media(max-width:1000px){.bx-kpis,.bx-kpis-4{grid-template-columns:repeat(2,1fr)}.bx-dash-grid{grid-template-columns:1fr}}
@media(max-width:820px){.bx-sidebar{display:none}.bx-page{padding:20px}}
@media(max-width:560px){.bx-kpis,.bx-kpis-4{grid-template-columns:1fr}.bx-table-wrap{overflow-x:auto}.bx-table{min-width:620px}}
@media(prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
`;
