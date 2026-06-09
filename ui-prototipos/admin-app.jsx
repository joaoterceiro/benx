import React, { useState, useMemo, useRef, useEffect } from "react";

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
  const [editId, setEditId] = useState(null);
  const ativa = NAV.find((n) => n.id === pagina);
  return (
    <div style={tokens}>
      <style>{CSS + EMP_CSS + CSS_CAD}</style>
      <div className="bx-shell">
        <aside className="bx-sidebar">
          <div className="bx-side-brand"><span className="bx-brand">Benx</span><span className="bx-side-tag">Admin</span></div>
          <nav className="bx-nav">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => setPagina(n.id)} className={`bx-nav-item ${pagina === n.id || (n.id === "emp" && pagina === "cadastro") ? "is-active" : ""}`}>
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
            {pagina === "emp" && <Empreendimentos onNovo={() => { setEditId(null); setPagina("cadastro"); }} onEditar={(id) => { setEditId(id); setPagina("cadastro"); }} />}
            {pagina === "cadastro" && <PageCadastro onVoltar={() => setPagina("emp")} />}
            {pagina === "midias" && <Midias />}
            {pagina === "leads" && <Leads />}
            {!["dashboard", "emp", "cadastro", "midias", "leads"].includes(pagina) && <EmBreve titulo={ativa.label} />}
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


// ──────────────────────── EMPREENDIMENTOS (listagem) ────────────────────
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
const statusLabel = (v) => STATUS.find((s) => s.value === v)?.label ?? "";
const tipoLabel = (v) => TIPOS.find((t) => t.value === v)?.label ?? "";
const fmtData = (s) => { const [y, m, d] = s.split("-"); return `${d}/${m}/${y}`; };
const EMP_SEED = [
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

function Empreendimentos({ onNovo, onEditar }) {
  const [itens, setItens] = useState(EMP_SEED);
  const [linha, setLinha] = useState("");
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [tipo, setTipo] = useState("");
  const [status, setStatus] = useState("");
  const [vis, setVis] = useState("");
  const [ordem, setOrdem] = useState("recentes");
  const [view, setView] = useState("grade");
  const [menu, setMenu] = useState(null);

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
  const duplicar = (id) => { setItens((xs) => { const o = xs.find((e) => e.id === id); return [{ ...o, id: crypto.randomUUID(), nome: o.nome + " (cópia)", visivel: false, atualizadoEm: new Date().toISOString().slice(0, 10) }, ...xs]; }); setMenu(null); };

  return (
    <div onClick={() => menu && setMenu(null)}>
      <div className="bx-page-head">
        <div><h1 className="bx-title">Empreendimentos</h1><p className="bx-sub">{resultados.length} de {itens.length}{linha ? ` · ${linhaInfo(linha).label}` : ""}</p></div>
        <button className="bx-btn-primary" onClick={onNovo}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>Novo empreendimento</button>
      </div>
      <div className="bx-pills">
        <button className={`bx-pill ${linha === "" ? "is-active" : ""}`} onClick={() => setLinha("")}>Todas</button>
        {LINHAS.map((l) => (
          <button key={l.value} className={`bx-pill ${linha === l.value ? "is-active" : ""}`} onClick={() => { setLinha(l.value); setEstado(""); setCidade(""); }} style={linha === l.value ? { borderColor: l.cor, background: l.bg, color: l.cor } : {}}>
            <span className="bx-pill-dot" style={{ background: l.cor }} />{l.label}
          </button>
        ))}
      </div>
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
      {resultados.length === 0 ? (
        <div className="bx-empty"><p className="bx-empty-title">Nenhum empreendimento encontrado</p><p className="bx-empty-sub">Ajuste os filtros para ampliar a busca.</p><button className="bx-empty-btn" onClick={() => { limpar(); setLinha(""); }}>Limpar tudo</button></div>
      ) : view === "grade" ? (
        <div className="bx-grid">{resultados.map((e) => <CardAdmin key={e.id} e={e} menu={menu} setMenu={setMenu} onEditar={onEditar} onToggleVis={toggleVis} onDup={duplicar} onDel={excluir} />)}</div>
      ) : (
        <Tabela itens={resultados} menu={menu} setMenu={setMenu} onEditar={onEditar} onToggleVis={toggleVis} onDup={duplicar} onDel={excluir} />
      )}
    </div>
  );
}

function CardAdmin({ e, menu, setMenu, onEditar, onToggleVis, onDup, onDel }) {
  const l = linhaInfo(e.linha);
  return (
    <div className="bx-card">
      <div className="bx-card-img" style={{ background: `linear-gradient(135deg, ${l.bg}, var(--bg-muted))` }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={l.cor} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M15 9h.01M15 13h.01" /></svg>
        <span className="bx-card-status">{statusLabel(e.status)}</span>
        <span className="bx-card-linha" style={{ background: l.cor }}>{l.label}</span>
      </div>
      <div className="bx-card-body">
        <div className="bx-card-titlerow"><p className="bx-card-nome">{e.nome}</p><Vis on={e.visivel} /></div>
        <p className="bx-card-loc">{e.bairro}, {e.cidade} · {e.estado}</p>
        <div className="bx-card-meta"><span>{e.metragem}</span><span>{e.unidades} un.</span><span>{tipoLabel(e.tipo)}</span></div>
        <p className="bx-card-upd">Atualizado em {fmtData(e.atualizadoEm)}</p>
      </div>
      <div className="bx-card-actions">
        <button className="bx-act" onClick={() => onEditar(e.id)}>Editar</button>
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

function Tabela({ itens, menu, setMenu, onEditar, onToggleVis, onDup, onDel }) {
  return (
    <div className="bx-table-wrap">
      <table className="bx-table">
        <thead><tr><th>Empreendimento</th><th>Vertente</th><th>Local</th><th>Status</th><th>Visibilidade</th><th>Atualizado</th><th></th></tr></thead>
        <tbody>
          {itens.map((e) => {
            const l = linhaInfo(e.linha);
            return (
              <tr key={e.id}>
                <td><button className="bx-tlink" onClick={() => onEditar(e.id)}>{e.nome}</button><span className="bx-tmeta">{e.metragem} · {e.unidades} un.</span></td>
                <td><span className="bx-tvert" style={{ color: l.cor }}><span className="bx-pill-dot" style={{ background: l.cor }} />{l.label}</span></td>
                <td>{e.bairro}, {e.cidade}<span className="bx-tmeta">{e.estado}</span></td>
                <td>{statusLabel(e.status)}</td>
                <td><Vis on={e.visivel} /></td>
                <td>{fmtData(e.atualizadoEm)}</td>
                <td className="bx-tactions">
                  <button className="bx-act" onClick={() => onEditar(e.id)}>Editar</button>
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

const EMP_CSS = `
.bx-filters-right{display:flex;align-items:center;gap:8px;margin-left:auto}
.bx-viewtoggle{display:flex;border:1px solid var(--border-default);border-radius:9px;overflow:hidden;background:var(--bg-canvas)}
.bx-viewtoggle button{display:grid;place-items:center;width:34px;height:34px;border:none;background:none;color:var(--text-tertiary);cursor:pointer;transition:background .12s var(--ease),color .12s var(--ease)}
.bx-viewtoggle button.is-active{background:var(--bg-surface);color:var(--text-primary);box-shadow:var(--shadow-xs)}
.bx-chips{display:flex;gap:7px;flex-wrap:wrap;align-items:center;margin-top:12px}
.bx-chip{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:500;color:var(--text-primary);background:var(--bg-surface);border:1px solid var(--border-emphasis);border-radius:9999px;padding:4px 6px 4px 11px;cursor:pointer;font-family:inherit;transition:background .15s var(--ease)}
.bx-chip:hover{background:var(--bg-muted)}
.bx-chip-x{display:grid;place-items:center;width:15px;height:15px;border-radius:9999px;background:var(--bg-muted);font-size:12px}
.bx-chip-clear{font-size:12px;color:var(--accent);background:none;border:none;cursor:pointer;padding:4px 6px;font-weight:500;font-family:inherit}
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
.bx-act{font-size:12px;font-weight:500;color:var(--text-primary);text-decoration:none;padding:6px 11px;border:1px solid var(--border-default);border-radius:8px;background:var(--bg-surface);cursor:pointer;font-family:inherit;transition:background .12s var(--ease)}
.bx-act:hover{background:var(--bg-muted)}
.bx-act.is-ghost{border-color:transparent;background:none;color:var(--text-secondary)}
.bx-act.is-ghost:hover{color:var(--text-primary);background:var(--bg-muted)}
.bx-menu .is-danger{color:var(--error)}
.bx-menu a{display:block;width:100%;text-align:left;padding:7px 10px;border-radius:7px;font-size:13px;color:var(--text-primary);text-decoration:none}
.bx-menu a:hover{background:var(--bg-muted)}
.bx-vis{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;padding:2px 8px;border-radius:9999px;white-space:nowrap}
.bx-vis.is-pub{color:var(--success);background:rgba(46,158,84,0.10)}
.bx-vis.is-pub .bx-vis-dot{background:var(--success)}
.bx-vis.is-hid{color:var(--text-tertiary);background:var(--bg-muted)}
.bx-vis.is-hid .bx-vis-dot{background:var(--text-tertiary)}
.bx-tvert{display:inline-flex;align-items:center;gap:6px;font-weight:600}
.bx-tactions{display:flex;align-items:center;gap:6px;justify-content:flex-end}
button.bx-tlink{background:none;border:none;font-family:inherit;cursor:pointer;padding:0}
button.bx-tlink:hover{color:var(--accent)}
@media(max-width:1000px){.bx-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:620px){.bx-grid{grid-template-columns:1fr}.bx-filters-right{margin-left:0;width:100%;justify-content:space-between}}
`;

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

// ════════════════════════════════════════════════════════════════════════
// Cadastro de Empreendimento — Premium Web.
// Form + preview ao vivo, reaproveitamento de taxonomias, feedback rico.
// ════════════════════════════════════════════════════════════════════════

const STATUS_OBRA = [
  { value: "lancamento", label: "Lançamento" },
  { value: "em_construcao", label: "Em construção" },
  { value: "pronto_para_morar", label: "Pronto para morar" },
  { value: "entregue", label: "Entregue" },
];
const TIPO_HABITACAO = [
  { value: "his", label: "HIS" }, { value: "hmp", label: "HMP" }, { value: "his_e_hmp", label: "HIS e HMP" },
];
const TIPO = [{ value: "residencial", label: "Residencial" }, { value: "comercial", label: "Comercial" }];
const LINHA_PRODUTO = [
  { value: "benx_unicos", label: "Benx Únicos", nota: "Alto padrão", cor: "#7A5C1E", bg: "rgba(122,92,30,0.10)" },
  { value: "benx", label: "Benx", nota: "Médio padrão", cor: "#0A4DCC", bg: "rgba(10,77,204,0.10)" },
  { value: "vivabenx", label: "VivaBenx", nota: "Econômico (HIS/HMP)", cor: "#2E9E54", bg: "rgba(46,158,84,0.12)" },
];
const TABS = [
  { id: "basico", label: "Básico", desc: "Identificação e situação do empreendimento" },
  { id: "midias", label: "Mídias", desc: "Imagens, galerias e vídeos da página" },
  { id: "caracteristicas", label: "Características", desc: "Números, diferenciais, áreas comuns e texto legal" },
  { id: "localizacao", label: "Localização", desc: "Endereço, mapa e ponto de venda" },
  { id: "obra", label: "Obra", desc: "Andamento físico e registro fotográfico" },
  { id: "plantas", label: "Plantas", desc: "Tipologias disponíveis" },
  { id: "visibilidade", label: "Visibilidade", desc: "O que aparece na página pública" },
];

// ── Dados reaproveitáveis (no projeto real vêm das taxonomias do banco) ──
const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
const CIDADES_EXISTENTES = [
  { nome: "São Paulo", uf: "SP" }, { nome: "Campinas", uf: "SP" }, { nome: "Guarulhos", uf: "SP" },
  { nome: "Santo André", uf: "SP" }, { nome: "São Bernardo do Campo", uf: "SP" },
  { nome: "Rio de Janeiro", uf: "RJ" }, { nome: "Belo Horizonte", uf: "MG" },
];
const BAIRROS_EXISTENTES = {
  "São Paulo": ["Itaim Bibi", "Vila Olímpia", "Moema", "Pinheiros", "Brooklin", "Jardins", "Vila Mariana", "Perdizes"],
  "Campinas": ["Cambuí", "Nova Campinas", "Taquaral"],
  "Rio de Janeiro": ["Barra da Tijuca", "Botafogo", "Leblon", "Ipanema"],
};

const novaPlanta = () => ({ uid: crypto.randomUUID(), nome: "", metragem: "", dormitorios: "", suites: "", vagas: "", recursos: "", imagem: null });
const novaArea = () => ({ uid: crypto.randomUUID(), nome: "", descricao: "", imagem: null });
const novoPonto = () => ({ uid: crypto.randomUUID(), nome: "", distancia: "" });
const novaCert = () => ({ uid: crypto.randomUUID(), nome: "", imagem: null });
const novaImg = (file) => ({ uid: crypto.randomUUID(), name: file.name, url: URL.createObjectURL(file) });
const slugify = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const cadStatusLabel = (v) => STATUS_OBRA.find((s) => s.value === v)?.label ?? "";

function PageCadastro({ onVoltar }) {
  const [tab, setTab] = useState("basico");
  const [tocado, setTocado] = useState({});
  const [estado, setEstado] = useState("idle");
  const [dirty, setDirty] = useState(false);
  const [cepStatus, setCepStatus] = useState("idle"); // idle | buscando | ok | erro
  const [salvoUmaVez, setSalvoUmaVez] = useState(false);
  const [form, setForm] = useState({
    nome: "", slug: "", subtitulo: "", linhaProduto: "", tipo: "residencial", tipoHabitacao: "",
    statusObra: "lancamento", previsaoEntrega: "",
    oProjeto: "", arquitetura: "", paisagismo: "", interiores: "",
    totalUnidades: "", totalAndares: "", unidadesPorAndar: "", numeroTorres: "",
    areaTerreno: "", areaConstruida: "", metragem: "", quartos: "", vagas: "",
    enderecoParcial: "", enderecoCompleto: "", bairro: "", cidade: "", estado: "", cep: "",
    enderecoVendas: "", standDeVendas: "", linkMaps: "", linkUber: "", linkWaze: "",
    urlVideoPrincipal: "", urlTourVirtual: "", vistasDoAndar: "",
    obraFundacao: 0, obraAlvenaria: 0, obraAcabamento: 0, obraTotal: 0, obraDocumentacao: "", obraAtualizadaEm: "",
    visivel: true, exibirObras: false, exibirPlantas: true, exibirLocalizacao: true, modoBreveLancamento: false,
    redirecionarPara: "",
    diferenciais: "", textoLegal: "",
  });
  const [imagemPrincipal, setImagemPrincipal] = useState(null);
  const [logotipo, setLogotipo] = useState(null);
  const [galeriaFachada, setGaleriaFachada] = useState([]);
  const [areasComuns, setAreasComuns] = useState([novaArea()]);
  const [pontos, setPontos] = useState([novoPonto()]);
  const [certificacoes, setCertificacoes] = useState([]);
  const [galeriaObra, setGaleriaObra] = useState([]);
  const [plantas, setPlantas] = useState([novaPlanta()]);
  const [salvo, setSalvo] = useState(null);

  // marca alterações não salvas (pula o primeiro render)
  const montou = useRef(false);
  useEffect(() => {
    if (montou.current) setDirty(true);
    else montou.current = true;
  }, [form, imagemPrincipal, logotipo, galeriaFachada, areasComuns, pontos, certificacoes, galeriaObra, plantas]);

  const set = (campo, valor) => setForm((f) => { const n = { ...f, [campo]: valor }; if (campo === "nome") n.slug = slugify(valor); return n; });
  const tocar = (campo) => setTocado((t) => ({ ...t, [campo]: true }));
  const setPlanta = (uid, c, v) => setPlantas((ps) => ps.map((p) => (p.uid === uid ? { ...p, [c]: v } : p)));
  const addPlanta = () => setPlantas((ps) => [...ps, novaPlanta()]);
  const removePlanta = (uid) => setPlantas((ps) => (ps.length > 1 ? ps.filter((p) => p.uid !== uid) : ps));
  const setArea = (uid, c, v) => setAreasComuns((as) => as.map((a) => (a.uid === uid ? { ...a, [c]: v } : a)));
  const addArea = () => setAreasComuns((as) => [...as, novaArea()]);
  const removeArea = (uid) => setAreasComuns((as) => (as.length > 1 ? as.filter((a) => a.uid !== uid) : as));
  const setPonto = (uid, c, v) => setPontos((ps) => ps.map((p) => (p.uid === uid ? { ...p, [c]: v } : p)));
  const addPonto = () => setPontos((ps) => [...ps, novoPonto()]);
  const removePonto = (uid) => setPontos((ps) => ps.filter((p) => p.uid !== uid));
  const setCert = (uid, c, v) => setCertificacoes((cs) => cs.map((x) => (x.uid === uid ? { ...x, [c]: v } : x)));
  const addCert = () => setCertificacoes((cs) => [...cs, novaCert()]);
  const removeCert = (uid) => setCertificacoes((cs) => cs.filter((x) => x.uid !== uid));

  // seleção de cidade reaproveita a UF automaticamente
  const selecionarCidade = (nome) => {
    const conhecida = CIDADES_EXISTENTES.find((c) => c.nome.toLowerCase() === nome.trim().toLowerCase());
    setForm((f) => ({ ...f, cidade: nome, estado: conhecida ? conhecida.uf : f.estado, bairro: nome !== f.cidade ? "" : f.bairro }));
  };

  // busca endereço pelo CEP (ViaCEP). Falha graciosamente: o usuário preenche na mão.
  const buscarCep = async (cepRaw) => {
    const cep = (cepRaw || "").replace(/\D/g, "");
    if (cep.length !== 8) return;
    setCepStatus("buscando");
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) { setCepStatus("erro"); return; }
      setForm((f) => ({
        ...f,
        enderecoCompleto: data.logradouro || f.enderecoCompleto,
        bairro: data.bairro || f.bairro,
        cidade: data.localidade || f.cidade,
        estado: data.uf || f.estado,
      }));
      setCepStatus("ok");
    } catch {
      setCepStatus("erro"); // bloqueio de rede ou CEP indisponível: segue manual
    }
  };

  const erros = useMemo(() => {
    const e = {};
    if (!form.nome.trim()) e.nome = "Dê um nome ao empreendimento.";
    if (!form.linhaProduto) e.linhaProduto = "Selecione a vertente Benx.";
    if (form.cep && !/^\d{5}-?\d{3}$/.test(form.cep)) e.cep = "Use o formato 00000-000.";
    if (form.linkMaps && !/^https?:\/\//.test(form.linkMaps)) e.linkMaps = "Inclua https:// no link.";
    return e;
  }, [form]);
  const errosPorTab = {
    basico: ["nome", "linhaProduto"].some((k) => erros[k]),
    localizacao: ["cep", "linkMaps"].some((k) => erros[k]),
  };
  const algumTocado = tocado.nome || tocado.linhaProduto || tocado.cep || tocado.linkMaps;

  // completude por tab (para o check verde)
  const tabCompleta = {
    basico: !!form.nome.trim() && !!form.linhaProduto,
    midias: !!imagemPrincipal && galeriaFachada.length > 0,
    caracteristicas: !!form.metragem,
    localizacao: !!form.enderecoCompleto && !!form.cidade,
    plantas: plantas.some((p) => p.nome.trim()),
  };

  const totalMidias = (imagemPrincipal ? 1 : 0) + (logotipo ? 1 : 0) + galeriaFachada.length + galeriaObra.length;
  const completude = useMemo(() => {
    const c = [!!form.nome.trim(), !!form.linhaProduto, !!form.subtitulo, !!imagemPrincipal, galeriaFachada.length > 0, !!form.metragem, !!form.enderecoCompleto, !!form.cidade, plantas.some((p) => p.nome.trim())];
    return Math.round((c.filter(Boolean).length / c.length) * 100);
  }, [form, imagemPrincipal, galeriaFachada, plantas]);

  const montarPayload = () => ({
    empreendimento: {
      ...form,
      diferenciais: form.diferenciais.split("\n").map((s) => s.trim()).filter(Boolean),
      imagemPrincipal: imagemPrincipal?.name ?? null, logotipo: logotipo?.name ?? null,
      galeriaFachada: galeriaFachada.map((i) => i.name), galeriaObra: galeriaObra.map((i) => i.name),
    },
    areasComuns: areasComuns.filter((a) => a.nome.trim()).map(({ uid, imagem, ...a }) => ({ ...a, imagem: imagem?.name ?? null })),
    detalhesLocalizacao: pontos.filter((p) => p.nome.trim()).map(({ uid, ...p }) => p),
    certificacoes: certificacoes.filter((c) => c.nome.trim()).map(({ uid, imagem, ...c }) => ({ ...c, imagem: imagem?.name ?? null })),
    plantas: plantas.map(({ uid, recursos, imagem, ...p }) => ({ ...p, recursos: recursos.split("\n").map((s) => s.trim()).filter(Boolean), imagem: imagem?.name ?? null })),
  });
  const salvar = async () => {
    setTocado((t) => ({ ...t, nome: true, linhaProduto: true }));
    if (Object.keys(erros).length) { if (errosPorTab.basico) setTab("basico"); else if (errosPorTab.localizacao) setTab("localizacao"); return; }
    setEstado("salvando");
    await new Promise((r) => setTimeout(r, 900));
    setSalvo(montarPayload());
    setEstado("sucesso");
    setDirty(false);
    setSalvoUmaVez(true);
    setTimeout(() => { setEstado("idle"); onVoltar && onVoltar(); }, 1300);
  };

  const idx = TABS.findIndex((t) => t.id === tab);
  const prev = TABS[idx - 1], next = TABS[idx + 1];
  const cidadesSugeridas = CIDADES_EXISTENTES.filter((c) => !form.estado || c.uf === form.estado).map((c) => c.nome);
  const bairrosSugeridos = BAIRROS_EXISTENTES[form.cidade] || [];

  return (
    <div className="cad-scope">
      <div className="cad-root">
        <header className="cad-header">
          <div className="cad-header-inner">
            <button className="cad-back" onClick={onVoltar} title="Voltar">←</button>
            <div className="cad-header-title">
              <h1 className="cad-h1">{form.nome || "Novo empreendimento"}</h1>
              <div className="cad-header-sub">
                {(() => { const l = LINHA_PRODUTO.find((x) => x.value === form.linhaProduto); return l ? <span className="cad-eco" style={{ color: l.cor, background: l.bg }}>Ecossistema {l.label}</span> : null; })()}
                <span className="cad-slug">{form.slug ? `/${form.linhaProduto || "empreendimentos"}/${form.slug}` : "preencha o nome para gerar o endereço"}</span>
              </div>
            </div>
            <div className="cad-header-actions">
              <SaveState dirty={dirty} salvoUmaVez={salvoUmaVez} estado={estado} />
              <div className="cad-progress-wrap" title={`${completude}% preenchido`}>
                <svg width="34" height="34" viewBox="0 0 34 34" className="cad-ring">
                  <circle cx="17" cy="17" r="14" className="cad-ring-bg" />
                  <circle cx="17" cy="17" r="14" className="cad-ring-fg" style={{ strokeDasharray: 88, strokeDashoffset: 88 - (88 * completude) / 100 }} />
                </svg>
                <span className="cad-progress-num">{completude}</span>
              </div>
              <BotaoSalvar estado={estado} onClick={salvar} />
            </div>
          </div>
          <div className="cad-tabs">
            {TABS.map((t) => {
              const ativa = tab === t.id;
              const temErro = algumTocado && errosPorTab[t.id];
              const completa = tabCompleta[t.id] && !temErro;
              const badge = t.id === "midias" ? totalMidias : t.id === "plantas" ? plantas.length : 0;
              return (
                <button key={t.id} onClick={() => setTab(t.id)} className={`cad-tab ${ativa ? "is-active" : ""}`}>
                  {t.label}
                  {badge > 0 && <span className="cad-tab-badge">{badge}</span>}
                  {temErro ? <span className="cad-tab-dot" /> : completa ? <span className="cad-tab-check">✓</span> : null}
                </button>
              );
            })}
          </div>
        </header>

        <div className="cad-body">
          <main className="cad-form">
            <p className="cad-tab-desc">{TABS[idx]?.desc}</p>
            <div className="cad-card">

              {tab === "basico" && (
                <div className="cad-stack">
                  <Campo label="Nome do empreendimento" required hint="Aparece como título da página e gera o endereço (URL)." erro={tocado.nome && erros.nome}>
                    <input className="cad-inp" value={form.nome} onChange={(e) => set("nome", e.target.value)} onBlur={() => tocar("nome")} placeholder="PVN Corporate Boutique" data-invalid={tocado.nome && !!erros.nome} />
                  </Campo>
                  <Campo label="Subtítulo / slogan" hint="Frase curta exibida abaixo do nome no topo da página.">
                    <input className="cad-inp" value={form.subtitulo} onChange={(e) => set("subtitulo", e.target.value)} placeholder="Pronto para morar no coração do Itaim" />
                  </Campo>
                  <Campo label="Linha do produto" required hint="Vertente Benx. Define posicionamento, selo e filtro na busca." erro={tocado.linhaProduto && erros.linhaProduto}>
                    <div className="cad-grid-3">
                      {LINHA_PRODUTO.map((l) => (
                        <button key={l.value} onClick={() => { set("linhaProduto", l.value); tocar("linhaProduto"); }} className={`cad-linha ${form.linhaProduto === l.value ? "is-active" : ""}`} style={form.linhaProduto === l.value ? { borderColor: l.cor, background: l.bg } : {}}>
                          <span className="cad-linha-nome" style={form.linhaProduto === l.value ? { color: l.cor } : {}}>{l.label}</span>
                          <span className="cad-linha-nota">{l.nota}</span>
                        </button>
                      ))}
                    </div>
                  </Campo>
                  <Grupo titulo="Situação">
                    <div className="cad-grid-2">
                      <Campo label="Tipo" hint="Filtro em que o empreendimento aparece."><Select value={form.tipo} onChange={(v) => set("tipo", v)} options={TIPO} /></Campo>
                      <Campo label="Tipo de habitação" hint="Programa habitacional, quando aplicável."><Select value={form.tipoHabitacao} onChange={(v) => set("tipoHabitacao", v)} options={TIPO_HABITACAO} placeholder="Não se aplica" /></Campo>
                      <Campo label="Status da obra" hint="Estágio atual. Vira selo e filtro."><Select value={form.statusObra} onChange={(v) => set("statusObra", v)} options={STATUS_OBRA} /></Campo>
                      <Campo label="Previsão de entrega" hint="Mês e ano estimados."><input type="month" className="cad-inp" value={form.previsaoEntrega} onChange={(e) => set("previsaoEntrega", e.target.value)} /></Campo>
                    </div>
                  </Grupo>
                  <Grupo titulo="O projeto">
                    <Campo label="Descrição do projeto" hint="Texto de apresentação exibido na seção 'O Projeto'.">
                      <textarea className="cad-inp" rows={4} value={form.oProjeto} onChange={(e) => set("oProjeto", e.target.value)} placeholder="Projeto corporativo idealizado e desenvolvido pela RBR Asset Management, com foco em sofisticação e flexibilidade." />
                    </Campo>
                    <div className="cad-grid-3">
                      <Campo label="Arquitetura"><input className="cad-inp" value={form.arquitetura} onChange={(e) => set("arquitetura", e.target.value)} placeholder="Jonas Birger Arquitetura" /></Campo>
                      <Campo label="Paisagismo"><input className="cad-inp" value={form.paisagismo} onChange={(e) => set("paisagismo", e.target.value)} placeholder="Roberto Riscala" /></Campo>
                      <Campo label="Interiores"><input className="cad-inp" value={form.interiores} onChange={(e) => set("interiores", e.target.value)} placeholder="Mantesso Arquitetura" /></Campo>
                    </div>
                  </Grupo>
                </div>
              )}

              {tab === "midias" && (
                <div className="cad-stack">
                  <div className="cad-grid-media">
                    <Campo label="Imagem principal" hint="Foto de destaque: vira o fundo do topo e a imagem do projeto."><UploadSingle valor={imagemPrincipal} onChange={setImagemPrincipal} ratio="16 / 9" proporcao="16:9" /></Campo>
                    <Campo label="Logotipo" hint="Logo em PNG com fundo transparente."><UploadSingle valor={logotipo} onChange={setLogotipo} alto contain formato="PNG transparente" proporcao="livre" /></Campo>
                  </div>
                  <Grupo titulo="Galerias">
                    <Campo label="Fachada (carrossel)" hint="3 a 6 imagens recomendadas."><UploadMulti itens={galeriaFachada} onChange={setGaleriaFachada} proporcao="16:9" /></Campo>
                  </Grupo>
                  <Grupo titulo="Vídeos e tours">
                    <div className="cad-grid-2">
                      <Campo label="Vídeo principal" hint="Link YouTube/Vimeo."><input className="cad-inp" value={form.urlVideoPrincipal} onChange={(e) => set("urlVideoPrincipal", e.target.value)} placeholder="https://youtube.com/..." /></Campo>
                      <Campo label="Tour virtual" hint="Link do tour 360°."><input className="cad-inp" value={form.urlTourVirtual} onChange={(e) => set("urlTourVirtual", e.target.value)} placeholder="https://..." /></Campo>
                    </div>
                    <Campo label="Vistas do andar" hint="Link da ferramenta de vistas por andar."><input className="cad-inp" value={form.vistasDoAndar} onChange={(e) => set("vistasDoAndar", e.target.value)} placeholder="https://..." /></Campo>
                  </Grupo>
                </div>
              )}

              {tab === "caracteristicas" && (
                <div className="cad-stack">
                  <Grupo titulo="Números">
                    <div className="cad-grid-3">
                      <Campo label="Unidades"><input className="cad-inp" value={form.totalUnidades} onChange={(e) => set("totalUnidades", e.target.value)} inputMode="numeric" placeholder="68" /></Campo>
                      <Campo label="Andares"><input className="cad-inp" value={form.totalAndares} onChange={(e) => set("totalAndares", e.target.value)} inputMode="numeric" placeholder="12" /></Campo>
                      <Campo label="Unidades por andar"><input className="cad-inp" value={form.unidadesPorAndar} onChange={(e) => set("unidadesPorAndar", e.target.value)} inputMode="numeric" placeholder="1" /></Campo>
                      <Campo label="Torres"><input className="cad-inp" value={form.numeroTorres} onChange={(e) => set("numeroTorres", e.target.value)} inputMode="numeric" placeholder="1" /></Campo>
                      <Campo label="Área do terreno"><input className="cad-inp" value={form.areaTerreno} onChange={(e) => set("areaTerreno", e.target.value)} placeholder="4.790 m²" /></Campo>
                      <Campo label="Área construída"><input className="cad-inp" value={form.areaConstruida} onChange={(e) => set("areaConstruida", e.target.value)} placeholder="m²" /></Campo>
                      <Campo label="Metragem"><input className="cad-inp" value={form.metragem} onChange={(e) => set("metragem", e.target.value)} placeholder="537 a 536 m²" /></Campo>
                      <Campo label="Quartos"><input className="cad-inp" value={form.quartos} onChange={(e) => set("quartos", e.target.value)} placeholder="2 e 3" /></Campo>
                      <Campo label="Vagas"><input className="cad-inp" value={form.vagas} onChange={(e) => set("vagas", e.target.value)} placeholder="1 e 2" /></Campo>
                    </div>
                  </Grupo>
                  <Grupo titulo="Diferenciais">
                    <Campo label="Diferenciais" hint="Um por linha. Lista simples das áreas comuns.">
                      <textarea className="cad-inp" rows={5} value={form.diferenciais} onChange={(e) => set("diferenciais", e.target.value)} placeholder={"Carregadores para carros elétricos\nSistema BMS\nAr-condicionado central VRF"} />
                      <Contador texto={form.diferenciais} unidade="diferenciais" />
                    </Campo>
                  </Grupo>
                  <Grupo titulo="Áreas comuns">
                    {areasComuns.map((a, i) => (
                      <div key={a.uid} className="cad-item">
                        <div className="cad-item-head">
                          <span className="cad-micro">Área {i + 1}{a.nome.trim() ? ` · ${a.nome}` : ""}</span>
                          {areasComuns.length > 1 && <BotaoRemover onConfirm={() => removeArea(a.uid)} />}
                        </div>
                        <div className="cad-grid-planta">
                          <div className="cad-stack-sm">
                            <Campo label="Nome da área" hint="Como aparece na seção de áreas comuns."><input className="cad-inp" value={a.nome} onChange={(e) => setArea(a.uid, "nome", e.target.value)} placeholder="Rooftop com jardim" /></Campo>
                            <Campo label="Descrição" hint="Texto curto de apoio (opcional)."><textarea className="cad-inp" rows={3} value={a.descricao} onChange={(e) => setArea(a.uid, "descricao", e.target.value)} placeholder="Área de lazer no topo do edifício, com vista para a cidade." /></Campo>
                          </div>
                          <Campo label="Imagem"><UploadSingle valor={a.imagem} onChange={(img) => setArea(a.uid, "imagem", img)} ratio="4 / 3" proporcao="4:3" /></Campo>
                        </div>
                      </div>
                    ))}
                    <button onClick={addArea} className="cad-add">+ Adicionar área comum</button>
                  </Grupo>
                  <Grupo titulo="Certificações">
                    {certificacoes.length === 0 && <p className="cad-help">Nenhuma certificação. Adicione selos como LEED, AQUA, etc.</p>}
                    {certificacoes.map((c, i) => (
                      <div key={c.uid} className="cad-item">
                        <div className="cad-item-head">
                          <span className="cad-micro">Certificação {i + 1}{c.nome.trim() ? ` · ${c.nome}` : ""}</span>
                          <BotaoRemover onConfirm={() => removeCert(c.uid)} />
                        </div>
                        <div className="cad-grid-planta">
                          <Campo label="Nome"><input className="cad-inp" value={c.nome} onChange={(e) => setCert(c.uid, "nome", e.target.value)} placeholder="LEED Gold" /></Campo>
                          <Campo label="Selo"><UploadSingle valor={c.imagem} onChange={(img) => setCert(c.uid, "imagem", img)} alto contain formato="PNG transparente" proporcao="livre" /></Campo>
                        </div>
                      </div>
                    ))}
                    <button onClick={addCert} className="cad-add">+ Adicionar certificação</button>
                  </Grupo>
                  <Grupo titulo="Texto legal">
                    <Campo label="Texto legal do empreendimento" hint="Disclaimer jurídico exibido no rodapé da página (memorial, condições de venda, registro).">
                      <textarea className="cad-inp" rows={4} value={form.textoLegal} onChange={(e) => set("textoLegal", e.target.value)} placeholder="As unidades são vendidas Core & Shell. Imagens meramente ilustrativas. Empreendimento registrado sob nº ... no Cartório de Registro de Imóveis." />
                    </Campo>
                  </Grupo>
                </div>
              )}

              {tab === "localizacao" && (
                <div className="cad-stack">
                  <Campo label="CEP" hint="Digite o CEP para preencher endereço, bairro, cidade e estado automaticamente." erro={tocado.cep && erros.cep}>
                    <div className="cad-cep">
                      <input className="cad-inp" value={form.cep}
                        onChange={(e) => { set("cep", e.target.value); setCepStatus("idle"); }}
                        onBlur={(e) => { tocar("cep"); buscarCep(e.target.value); }}
                        placeholder="00000-000" inputMode="numeric" data-invalid={tocado.cep && !!erros.cep} />
                      {cepStatus === "buscando" && <span className="cad-cep-tag is-busy"><span className="cad-spin-sm" />buscando</span>}
                      {cepStatus === "ok" && <span className="cad-cep-tag is-ok">✓ preenchido</span>}
                      {cepStatus === "erro" && <span className="cad-cep-tag is-err">não encontrado, preencha manualmente</span>}
                    </div>
                  </Campo>
                  <Campo label="Endereço completo" hint="Logradouro, número e complemento."><input className="cad-inp" value={form.enderecoCompleto} onChange={(e) => set("enderecoCompleto", e.target.value)} placeholder="Av. Brigadeiro Faria Lima, 339" /></Campo>
                  <Campo label="Endereço parcial" hint="Versão curta para exibição pública (ex.: só a avenida e o bairro)."><input className="cad-inp" value={form.enderecoParcial} onChange={(e) => set("enderecoParcial", e.target.value)} placeholder="Av. Brigadeiro Faria Lima, Itaim" /></Campo>
                  <div className="cad-grid-loc2">
                    <Campo label="Estado" hint="Sigla (UF).">
                      <Select value={form.estado} onChange={(v) => set("estado", v)} options={UFS.map((u) => ({ value: u, label: u }))} placeholder="UF" />
                    </Campo>
                    <Campo label="Cidade" hint={cidadesSugeridas.length ? "Reaproveita cidades já cadastradas." : "Digite e use 'criar' para adicionar."}>
                      <Combobox value={form.cidade} onChange={selecionarCidade} options={cidadesSugeridas} placeholder="São Paulo" />
                    </Campo>
                    <Campo label="Bairro" hint={form.cidade ? "Sugestões da cidade selecionada." : "Selecione a cidade para ver sugestões."}>
                      <Combobox value={form.bairro} onChange={(v) => set("bairro", v)} options={bairrosSugeridos} placeholder="Itaim Bibi" />
                    </Campo>
                  </div>
                  <Campo label="Stand de vendas" hint="Endereço do plantão, se diferente."><input className="cad-inp" value={form.standDeVendas} onChange={(e) => set("standDeVendas", e.target.value)} /></Campo>
                  <Campo label="Endereço de vendas" hint="Endereço para o link de compra/contato, se aplicável."><input className="cad-inp" value={form.enderecoVendas} onChange={(e) => set("enderecoVendas", e.target.value)} /></Campo>
                  <Grupo titulo="Links de compartilhamento">
                    <div className="cad-grid-3">
                      <Campo label="Google Maps" erro={tocado.linkMaps && erros.linkMaps}><input className="cad-inp" value={form.linkMaps} onChange={(e) => set("linkMaps", e.target.value)} onBlur={() => tocar("linkMaps")} placeholder="https://maps.google.com/..." data-invalid={tocado.linkMaps && !!erros.linkMaps} /></Campo>
                      <Campo label="Uber"><input className="cad-inp" value={form.linkUber} onChange={(e) => set("linkUber", e.target.value)} placeholder="https://m.uber.com/..." /></Campo>
                      <Campo label="Waze"><input className="cad-inp" value={form.linkWaze} onChange={(e) => set("linkWaze", e.target.value)} placeholder="https://waze.com/ul/..." /></Campo>
                    </div>
                  </Grupo>
                  <Grupo titulo="Pontos de interesse próximos">
                    {pontos.map((p, i) => (
                      <div key={p.uid} className="cad-ponto">
                        <input className="cad-inp" value={p.nome} onChange={(e) => setPonto(p.uid, "nome", e.target.value)} placeholder="Shopping JK Iguatemi" />
                        <input className="cad-inp" value={p.distancia} onChange={(e) => setPonto(p.uid, "distancia", e.target.value)} placeholder="4.400 m" />
                        {pontos.length > 1 && <button onClick={() => removePonto(p.uid)} className="cad-ponto-x" title="Remover">×</button>}
                      </div>
                    ))}
                    <button onClick={addPonto} className="cad-add">+ Adicionar ponto</button>
                  </Grupo>
                </div>
              )}

              {tab === "obra" && (
                <div className="cad-stack">
                  <p className="cad-help">Defina o avanço de cada etapa. Os percentuais alimentam a barra de andamento na página pública.</p>
                  <Slider label="Fundação" value={form.obraFundacao} onChange={(v) => set("obraFundacao", v)} />
                  <Slider label="Alvenaria" value={form.obraAlvenaria} onChange={(v) => set("obraAlvenaria", v)} />
                  <Slider label="Acabamento" value={form.obraAcabamento} onChange={(v) => set("obraAcabamento", v)} />
                  <Slider label="Total da obra" value={form.obraTotal} onChange={(v) => set("obraTotal", v)} />
                  <div className="cad-grid-2">
                    <Campo label="Documentação" hint="Situação da documentação (ex.: Aprovada)."><input className="cad-inp" value={form.obraDocumentacao} onChange={(e) => set("obraDocumentacao", e.target.value)} placeholder="Aprovada" /></Campo>
                    <Campo label="Data de atualização" hint="Quando os percentuais foram atualizados."><input type="date" className="cad-inp" value={form.obraAtualizadaEm} onChange={(e) => set("obraAtualizadaEm", e.target.value)} /></Campo>
                  </div>
                  <Campo label="Galeria de imagens da obra" hint="Registro do canteiro. Atualize a cada avanço."><UploadMulti itens={galeriaObra} onChange={setGaleriaObra} proporcao="4:3" /></Campo>
                </div>
              )}

              {tab === "plantas" && (
                <div className="cad-stack">
                  {plantas.map((p, i) => (
                    <div key={p.uid} className="cad-item">
                      <div className="cad-item-head">
                        <span className="cad-micro">Planta {i + 1}{p.nome.trim() ? ` · ${p.nome}` : ""}</span>
                        {plantas.length > 1 && <BotaoRemover onConfirm={() => removePlanta(p.uid)} />}
                      </div>
                      <div className="cad-grid-planta">
                        <div className="cad-stack-sm">
                          <Campo label="Nome da tipologia" hint="Como aparece na lista de plantas."><input className="cad-inp" value={p.nome} onChange={(e) => setPlanta(p.uid, "nome", e.target.value)} placeholder="Tipo 1 — 2 dorms com suíte" /></Campo>
                          <div className="cad-grid-4">
                            <Campo label="Metragem"><input className="cad-inp" value={p.metragem} onChange={(e) => setPlanta(p.uid, "metragem", e.target.value)} placeholder="m²" inputMode="numeric" /></Campo>
                            <Campo label="Dorms"><input className="cad-inp" value={p.dormitorios} onChange={(e) => setPlanta(p.uid, "dormitorios", e.target.value)} inputMode="numeric" /></Campo>
                            <Campo label="Suítes"><input className="cad-inp" value={p.suites} onChange={(e) => setPlanta(p.uid, "suites", e.target.value)} inputMode="numeric" /></Campo>
                            <Campo label="Vagas"><input className="cad-inp" value={p.vagas} onChange={(e) => setPlanta(p.uid, "vagas", e.target.value)} inputMode="numeric" /></Campo>
                          </div>
                        </div>
                        <Campo label="Imagem"><UploadSingle valor={p.imagem} onChange={(img) => setPlanta(p.uid, "imagem", img)} ratio="4 / 3" proporcao="4:3" /></Campo>
                      </div>
                      <Campo label="Recursos" hint="Um por linha."><textarea className="cad-inp" rows={2} value={p.recursos} onChange={(e) => setPlanta(p.uid, "recursos", e.target.value)} placeholder={"Varanda gourmet\nLavabo"} /></Campo>
                    </div>
                  ))}
                  <button onClick={addPlanta} className="cad-add">+ Adicionar planta</button>
                </div>
              )}

              {tab === "visibilidade" && (
                <div>
                  <p className="cad-help" style={{ marginBottom: 4 }}>Controle quais seções aparecem na página pública.</p>
                  <Switch label="Visível no site" hint="Desligado, fica oculto da busca e do site." checked={form.visivel} onChange={(v) => set("visivel", v)} />
                  <Switch label="Exibir andamento de obras" hint="Mostra a barra de etapas e a galeria." checked={form.exibirObras} onChange={(v) => set("exibirObras", v)} />
                  <Switch label="Exibir plantas na página" hint="Mostra a seção de tipologias." checked={form.exibirPlantas} onChange={(v) => set("exibirPlantas", v)} />
                  <Switch label="Exibir localização" hint="Mostra o mapa e os endereços." checked={form.exibirLocalizacao} onChange={(v) => set("exibirLocalizacao", v)} />
                  <Switch label="Modo breve lançamento" hint="Exibe teaser de pré-lançamento." checked={form.modoBreveLancamento} onChange={(v) => set("modoBreveLancamento", v)} ultimo />
                  <div style={{ marginTop: 16 }}>
                    <Campo label="Redirecionar para outra página" hint="Opcional. Se preenchido, a página deste empreendimento redireciona para esta URL.">
                      <input className="cad-inp" value={form.redirecionarPara} onChange={(e) => set("redirecionarPara", e.target.value)} placeholder="https://... (deixe vazio para não redirecionar)" />
                    </Campo>
                  </div>
                </div>
              )}
            </div>

            <div className="cad-footnav">
              <button disabled={!prev} onClick={() => prev && setTab(prev.id)} className="cad-navbtn">← {prev?.label ?? ""}</button>
              <button disabled={!next} onClick={() => next && setTab(next.id)} className="cad-navbtn">{next?.label ?? ""} →</button>
            </div>
          </main>

          <aside className="cad-preview">
            <span className="cad-micro" style={{ marginBottom: 10, display: "block" }}>Pré-visualização do card</span>
            <CardPreview form={form} imagem={imagemPrincipal} plantas={plantas} areas={areasComuns} />
            <p className="cad-preview-note">Como o empreendimento aparece na listagem e na busca. Atualiza enquanto você preenche.</p>
          </aside>
        </div>

        {estado === "sucesso" && <div className="cad-toast">Empreendimento salvo com sucesso</div>}
      </div>
    </div>
  );
}

// ── Indicador de estado de salvamento ───────────────────────────────────
function SaveState({ dirty, salvoUmaVez, estado }) {
  if (estado === "salvando") return null;
  if (dirty) return <span className="cad-savestate is-dirty"><span className="cad-dot" />Não salvo</span>;
  if (salvoUmaVez) return <span className="cad-savestate is-ok"><span className="cad-dot" />Salvo</span>;
  return null;
}

function CardPreview({ form, imagem, plantas, areas }) {
  const linha = LINHA_PRODUTO.find((l) => l.value === form.linhaProduto);
  const nPlantas = plantas.filter((p) => p.nome.trim()).length;
  const nAreas = (areas || []).filter((a) => a.nome.trim()).length;
  return (
    <div className="cad-pcard">
      <div className="cad-pcard-img">
        {imagem ? <img src={imagem.url} alt="" /> : <div className="cad-pcard-ph">sem imagem</div>}
        {form.statusObra && <span className="cad-pcard-status">{cadStatusLabel(form.statusObra)}</span>}
        {linha && <span className="cad-pcard-linha" style={{ background: linha.cor }}>{linha.label}</span>}
      </div>
      <div className="cad-pcard-body">
        <p className="cad-pcard-nome">{form.nome || "Nome do empreendimento"}</p>
        {form.subtitulo && <p className="cad-pcard-sub">{form.subtitulo}</p>}
        <p className="cad-pcard-loc">{[form.bairro, form.cidade, form.estado].filter(Boolean).join(", ") || "Bairro, Cidade"}</p>
        <div className="cad-pcard-meta">
          {form.metragem && <span>{form.metragem}</span>}
          {nPlantas > 0 && <span>{nPlantas} planta{nPlantas !== 1 ? "s" : ""}</span>}
          {nAreas > 0 && <span>{nAreas} área{nAreas !== 1 ? "s" : ""}</span>}
        </div>
      </div>
    </div>
  );
}

function BotaoSalvar({ estado, onClick }) {
  const salvando = estado === "salvando", sucesso = estado === "sucesso";
  return (
    <button onClick={onClick} disabled={salvando} className={`cad-save ${sucesso ? "is-ok" : ""}`}>
      {salvando && <span className="cad-spin" />}
      {sucesso ? "Salvo ✓" : salvando ? "Salvando" : "Salvar"}
    </button>
  );
}

// confirmação em dois toques
function BotaoRemover({ onConfirm }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => { if (armed) { const t = setTimeout(() => setArmed(false), 3000); return () => clearTimeout(t); } }, [armed]);
  return (
    <button className={`cad-remove ${armed ? "is-armed" : ""}`} onClick={() => (armed ? onConfirm() : setArmed(true))}>
      {armed ? "Confirmar remoção?" : "Remover"}
    </button>
  );
}

// combobox com autocomplete + criar novo
function Combobox({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(value || "");
  useEffect(() => { setQ(value || ""); }, [value]);
  const filtered = options.filter((o) => o.toLowerCase().includes(q.toLowerCase()));
  const exact = options.some((o) => o.toLowerCase() === q.trim().toLowerCase());
  const commit = (val) => { onChange(val); setQ(val); setOpen(false); };
  const podeMostrar = open && (filtered.length > 0 || (q.trim() && !exact));
  return (
    <div className="cad-combo">
      <input className="cad-inp" value={q} placeholder={placeholder}
        onChange={(e) => { setQ(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)} />
      {podeMostrar && (
        <div className="cad-combo-pop">
          {filtered.map((o) => (
            <button key={o} className="cad-combo-opt" onMouseDown={(e) => { e.preventDefault(); commit(o); }}>
              <span>{o}</span><span className="cad-combo-tag">salvo</span>
            </button>
          ))}
          {q.trim() && !exact && (
            <button className="cad-combo-opt is-create" onMouseDown={(e) => { e.preventDefault(); commit(q.trim()); }}>
              + Criar "{q.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Grupo({ titulo, children }) {
  return (
    <div className="cad-grupo">
      <div className="cad-grupo-head"><span className="cad-micro">{titulo}</span><span className="cad-grupo-line" /></div>
      <div className="cad-stack-sm">{children}</div>
    </div>
  );
}
function Campo({ label, hint, erro, required, children }) {
  return (
    <div className="cad-field">
      <div className="cad-field-label">{label}{required && <span className="cad-req">*</span>}</div>
      {children}
      {erro ? <p className="cad-err">{erro}</p> : hint ? <p className="cad-hint">{hint}</p> : null}
    </div>
  );
}
function Select({ value, onChange, options, placeholder }) {
  return (
    <select className="cad-inp cad-select" value={value} onChange={(e) => onChange(e.target.value)}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
function Contador({ texto, unidade }) {
  const n = texto.split("\n").map((s) => s.trim()).filter(Boolean).length;
  return <p className="cad-hint" style={{ fontVariantNumeric: "tabular-nums" }}>{n} {unidade}</p>;
}
function Slider({ label, value, onChange }) {
  return (
    <div>
      <div className="cad-slider-head"><span className="cad-field-label" style={{ marginBottom: 0 }}>{label}</span><span className="cad-slider-val" style={{ color: value > 0 ? "var(--accent)" : "var(--text-tertiary)" }}>{value}%</span></div>
      <input type="range" min="0" max="100" value={value} onChange={(e) => onChange(Number(e.target.value))} className="cad-range" />
    </div>
  );
}
function Switch({ label, hint, checked, onChange, ultimo }) {
  return (
    <div className="cad-switch" style={ultimo ? { borderBottom: "none" } : {}}>
      <div><p className="cad-switch-label">{label}</p>{hint && <p className="cad-hint" style={{ marginTop: 2 }}>{hint}</p>}</div>
      <button onClick={() => onChange(!checked)} role="switch" aria-checked={checked} className={`cad-toggle ${checked ? "is-on" : ""}`}><span className="cad-toggle-dot" /></button>
    </div>
  );
}
function IconFoto() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2.5" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
    </svg>
  );
}
function UploadSingle({ valor, onChange, alto, ratio, contain, formato = "PNG, JPG ou WebP", proporcao }) {
  const ref = useRef(null);
  const [over, setOver] = useState(false);
  const pick = (e) => { const f = e.target.files?.[0]; if (f) onChange(novaImg(f)); };
  const drop = (e) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files?.[0]; if (f) onChange(novaImg(f)); };
  const style = ratio ? { aspectRatio: ratio } : undefined;
  const fix = alto && !ratio;
  const sub = proporcao ? `${formato} · ${proporcao}` : formato;
  return (
    <div>
      <input ref={ref} type="file" accept="image/*" className="cad-hidden" onChange={pick} />
      {valor ? (
        <div className={`cad-up-filled ${fix ? "fix" : ""} ${contain ? "is-contain" : ""}`} style={style}>
          <img src={valor.url} alt="" />
          {proporcao && <span className="cad-up-ratio">{proporcao}</span>}
          <div className="cad-up-overlay"><button onClick={() => ref.current?.click()} className="cad-up-btn">Trocar</button><button onClick={() => onChange(null)} className="cad-up-btn is-del">Remover</button></div>
        </div>
      ) : (
        <button onClick={() => ref.current?.click()} onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={drop} className={`cad-up-empty ${fix ? "fix" : ""} ${over ? "is-over" : ""}`} style={style}>
          <span className="cad-up-icon"><IconFoto /></span>
          <span className="cad-up-main">{over ? "Solte a imagem" : "Arraste ou clique"}</span>
          <span className="cad-up-sub">{sub}</span>
        </button>
      )}
    </div>
  );
}
function UploadMulti({ itens, onChange, formato = "PNG ou JPG", proporcao }) {
  const ref = useRef(null);
  const [over, setOver] = useState(false);
  const add = (files) => { const fs = Array.from(files ?? []); if (fs.length) onChange([...itens, ...fs.map(novaImg)]); };
  const drop = (e) => { e.preventDefault(); setOver(false); add(e.dataTransfer.files); };
  const remove = (uid) => onChange(itens.filter((i) => i.uid !== uid));
  const sub = proporcao ? `${formato} · ${proporcao} · várias` : `${formato} · várias de uma vez`;
  return (
    <div>
      <input ref={ref} type="file" accept="image/*" multiple className="cad-hidden" onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
      {itens.length === 0 ? (
        <button onClick={() => ref.current?.click()} onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={drop} className={`cad-up-empty is-wide ${over ? "is-over" : ""}`}>
          <span className="cad-up-icon"><IconFoto /></span>
          <span className="cad-up-main">{over ? "Solte as imagens" : "Arraste imagens ou clique"}</span>
          <span className="cad-up-sub">{sub}</span>
        </button>
      ) : (
        <div className="cad-up-grid">
          {itens.map((img, i) => (
            <div key={img.uid} className="cad-up-thumb">
              <img src={img.url} alt="" /><button onClick={() => remove(img.uid)} className="cad-up-x">×</button><span className="cad-up-n">{i + 1}</span>
            </div>
          ))}
          <button onClick={() => ref.current?.click()} onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={drop} className={`cad-up-more ${over ? "is-over" : ""}`}>+</button>
        </div>
      )}
      {itens.length > 0 && <p className="cad-hint" style={{ fontVariantNumeric: "tabular-nums" }}>{itens.length} imagem(ns){proporcao ? ` · ${proporcao}` : ""} · arraste mais no "+"</p>}
    </div>
  );
}

const tokensCad = {
  "--font-display": "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Inter', system-ui, sans-serif",
  "--font-body": "'SF Pro Text', -apple-system, BlinkMacSystemFont, 'SF Pro', 'Inter', system-ui, sans-serif",
  "--font-mono": "ui-monospace, 'SF Mono', 'JetBrains Mono', Menlo, monospace",
  "--bg-canvas": "#FBFBFD", "--bg-surface": "#FFFFFF", "--bg-muted": "#F4F4F6",
  "--text-primary": "#1A1A1F", "--text-secondary": "#6B6B73", "--text-tertiary": "#9B9BA3",
  "--border-default": "rgba(20,20,30,0.09)", "--border-emphasis": "rgba(20,20,30,0.15)",
  "--accent": "#0A4DCC", "--accent-subtle": "rgba(10,77,204,0.08)",
  "--error": "#E5484D", "--error-fg": "#B0282C", "--success": "#2E9E54", "--warning": "#B7791F", "--warning-bg": "rgba(183,121,31,0.12)",
  "--shadow-xs": "0 1px 2px rgba(0,0,0,0.04), 0 1px 1px rgba(0,0,0,0.02)",
  "--shadow-md": "0 4px 12px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.03)",
  "--shadow-lg": "0 12px 32px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.04)",
  "--ease": "cubic-bezier(0.25, 1, 0.5, 1)", "--ease-spring": "cubic-bezier(0.32, 0.72, 0, 1)",
};

const CSS_CAD = `
.cad-root{min-height:100vh;background:var(--bg-canvas);color:var(--text-primary);font-family:var(--font-body);font-size:14px;-webkit-font-smoothing:antialiased;letter-spacing:-0.003em}
.cad-header{position:sticky;top:0;z-index:30;background:rgba(251,251,253,0.85);backdrop-filter:saturate(180%) blur(12px);-webkit-backdrop-filter:saturate(180%) blur(12px);border-bottom:1px solid var(--border-default)}
.cad-topnav{max-width:1040px;margin:0 auto;padding:0 24px;height:46px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border-subtle,rgba(20,20,30,0.05))}
.cad-topnav-left{display:flex;align-items:center;gap:12px;min-width:0}
.cad-brand{font-family:var(--font-display);font-size:15px;font-weight:700;letter-spacing:-0.02em;color:var(--text-primary)}
.cad-crumb{font-size:12px;color:var(--text-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cad-crumb strong{color:var(--text-secondary);font-weight:600}
.cad-topnav-right{display:flex;align-items:center;gap:8px}
.cad-navlink{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:500;color:var(--text-secondary);text-decoration:none;padding:6px 11px;border:1px solid var(--border-default);border-radius:9px;background:var(--bg-surface);transition:background .15s var(--ease),color .15s var(--ease),border-color .15s var(--ease)}
.cad-navlink:hover{background:var(--bg-muted);color:var(--text-primary);border-color:var(--border-emphasis)}
.cad-back{flex-shrink:0;width:32px;height:32px;border:1px solid var(--border-default);background:var(--bg-surface);border-radius:9px;color:var(--text-secondary);font-size:16px;cursor:pointer;margin-right:6px;transition:background .15s var(--ease)}
.cad-back:hover{background:var(--bg-muted);color:var(--text-primary)}
.cad-scope{min-height:100%}
.cad-header-inner{max-width:1040px;margin:0 auto;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px}
.cad-header-title{min-width:0}
.cad-h1{font-family:var(--font-display);font-size:19px;font-weight:600;letter-spacing:-0.018em;line-height:1.2;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cad-slug{font-family:var(--font-mono);font-size:11px;color:var(--text-tertiary);margin:3px 0 0}
.cad-header-sub{display:flex;align-items:center;gap:8px;margin-top:4px;flex-wrap:wrap}
.cad-header-sub .cad-slug{margin:0}
.cad-eco{font-size:11px;font-weight:600;padding:2px 8px;border-radius:9999px;white-space:nowrap}
.cad-header-actions{display:flex;align-items:center;gap:12px}
.cad-savestate{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:500;padding:3px 9px;border-radius:9999px}
.cad-savestate .cad-dot{width:6px;height:6px;border-radius:9999px}
.cad-savestate.is-dirty{color:var(--warning);background:var(--warning-bg)}
.cad-savestate.is-dirty .cad-dot{background:var(--warning)}
.cad-savestate.is-ok{color:var(--success);background:rgba(46,158,84,0.10)}
.cad-savestate.is-ok .cad-dot{background:var(--success)}
.cad-progress-wrap{position:relative;width:34px;height:34px;display:grid;place-items:center}
.cad-ring{transform:rotate(-90deg)}
.cad-ring-bg{fill:none;stroke:var(--border-default);stroke-width:3}
.cad-ring-fg{fill:none;stroke:var(--accent);stroke-width:3;stroke-linecap:round;transition:stroke-dashoffset var(--ease) .4s}
.cad-progress-num{position:absolute;font-size:10px;font-weight:600;font-variant-numeric:tabular-nums}
.cad-tabs{max-width:1040px;margin:0 auto;padding:0 24px;display:flex;gap:2px;overflow-x:auto;scrollbar-width:none}
.cad-tabs::-webkit-scrollbar{display:none}
.cad-tab{position:relative;white-space:nowrap;padding:9px 12px 11px;font-size:13px;font-weight:500;color:var(--text-tertiary);background:none;border:none;cursor:pointer;transition:color .15s var(--ease);display:inline-flex;align-items:center;gap:6px}
.cad-tab:hover{color:var(--text-secondary)}
.cad-tab.is-active{color:var(--text-primary)}
.cad-tab.is-active::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:2px;border-radius:2px;background:var(--accent)}
.cad-tab-badge{font-size:11px;font-weight:600;font-variant-numeric:tabular-nums;background:var(--bg-muted);color:var(--text-secondary);border-radius:9999px;padding:0 6px;line-height:16px}
.cad-tab-dot{width:6px;height:6px;border-radius:9999px;background:var(--error)}
.cad-tab-check{font-size:10px;font-weight:700;color:var(--success);line-height:1}
.cad-body{max-width:1040px;margin:0 auto;padding:24px;display:grid;grid-template-columns:1fr 300px;gap:24px;align-items:start}
.cad-form{min-width:0}
.cad-tab-desc{font-size:13px;color:var(--text-secondary);margin:0 0 14px}
.cad-card{background:var(--bg-surface);border:1px solid var(--border-default);border-radius:14px;padding:24px;box-shadow:var(--shadow-xs)}
.cad-stack{display:flex;flex-direction:column;gap:20px}
.cad-stack-sm{display:flex;flex-direction:column;gap:14px}
.cad-grupo{display:flex;flex-direction:column;gap:14px}
.cad-grupo-head{display:flex;align-items:center;gap:10px}
.cad-grupo-line{flex:1;height:1px;background:var(--border-default)}
.cad-micro{font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-tertiary)}
.cad-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.cad-grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
.cad-grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.cad-grid-media{display:grid;grid-template-columns:2fr 1fr;gap:16px}
.cad-grid-planta{display:grid;grid-template-columns:2fr 1fr;gap:16px}
.cad-grid-loc{display:grid;grid-template-columns:80px 1fr 1fr 120px;gap:12px}
.cad-grid-loc2{display:grid;grid-template-columns:80px 1fr 1fr;gap:12px}
.cad-cep{display:flex;align-items:center;gap:10px}
.cad-cep .cad-inp{max-width:160px}
.cad-cep-tag{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:500}
.cad-cep-tag.is-busy{color:var(--text-secondary)}
.cad-cep-tag.is-ok{color:var(--success)}
.cad-cep-tag.is-err{color:var(--warning)}
.cad-spin-sm{width:11px;height:11px;border-radius:9999px;border:2px solid var(--border-emphasis);border-top-color:var(--text-secondary);animation:bxspin .6s linear infinite}
.cad-field-label{font-size:13px;font-weight:500;color:var(--text-primary);margin-bottom:6px;display:flex;align-items:baseline;gap:3px}
.cad-req{color:var(--error)}
.cad-hint{font-size:12px;line-height:1.4;color:var(--text-tertiary);margin:6px 0 0}
.cad-err{font-size:12px;line-height:1.4;color:var(--error-fg);margin:6px 0 0}
.cad-help{font-size:13px;color:var(--text-secondary);margin:0}
.cad-inp{width:100%;border:1px solid var(--border-default);background:var(--bg-surface);color:var(--text-primary);border-radius:10px;padding:9px 12px;font-size:14px;font-family:inherit;outline:none;transition:border-color .15s var(--ease),box-shadow .15s var(--ease)}
.cad-inp::placeholder{color:var(--text-tertiary);opacity:.55}
.cad-inp:focus-visible{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-subtle)}
.cad-inp[data-invalid="true"]{border-color:var(--error)}
.cad-inp[data-invalid="true"]:focus-visible{box-shadow:0 0 0 3px rgba(229,72,77,0.12)}
textarea.cad-inp{resize:vertical;line-height:1.5}
.cad-select{appearance:none;cursor:pointer}
.cad-combo{position:relative}
.cad-combo-pop{position:absolute;z-index:20;left:0;right:0;top:calc(100% + 4px);background:var(--bg-surface);border:1px solid var(--border-default);border-radius:10px;box-shadow:var(--shadow-lg);padding:4px;max-height:200px;overflow-y:auto;animation:bxpop .12s var(--ease)}
.cad-combo-opt{display:flex;align-items:center;justify-content:space-between;width:100%;text-align:left;padding:7px 9px;border:none;background:none;border-radius:7px;font-size:13px;font-family:inherit;color:var(--text-primary);cursor:pointer;transition:background .1s var(--ease)}
.cad-combo-opt:hover{background:var(--bg-muted)}
.cad-combo-opt.is-create{color:var(--accent);font-weight:500}
.cad-combo-tag{font-size:10px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-tertiary)}
@keyframes bxpop{from{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:translateY(0)}}
.cad-linha{text-align:left;border:1px solid var(--border-default);background:var(--bg-surface);border-radius:10px;padding:10px 12px;cursor:pointer;transition:border-color .15s var(--ease),background .15s var(--ease)}
.cad-linha:hover{border-color:var(--border-emphasis)}
.cad-linha-nome{display:block;font-size:13px;font-weight:600;color:var(--text-primary)}
.cad-linha-nota{display:block;font-size:11px;color:var(--text-tertiary);margin-top:2px}
.cad-slider-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.cad-slider-val{font-family:var(--font-mono);font-size:13px;font-weight:600;font-variant-numeric:tabular-nums}
.cad-range{width:100%;accent-color:var(--accent);cursor:pointer}
.cad-switch{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:11px 0;border-bottom:1px solid var(--border-default)}
.cad-switch-label{font-size:13px;font-weight:500;color:var(--text-primary);margin:0}
.cad-toggle{position:relative;width:36px;height:20px;flex-shrink:0;margin-top:2px;border:none;border-radius:9999px;background:var(--border-emphasis);cursor:pointer;transition:background .2s var(--ease)}
.cad-toggle.is-on{background:var(--accent)}
.cad-toggle-dot{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:9999px;background:#fff;box-shadow:var(--shadow-xs);transition:left .2s var(--ease-spring)}
.cad-toggle.is-on .cad-toggle-dot{left:18px}
.cad-item{background:var(--bg-canvas);border:1px solid var(--border-default);border-radius:12px;padding:16px;animation:bxitem .25s var(--ease)}
@keyframes bxitem{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
.cad-item-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px}
.cad-item-head .cad-micro{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cad-remove{flex-shrink:0;font-size:12px;color:var(--text-tertiary);background:none;border:none;cursor:pointer;border-radius:6px;padding:3px 7px;transition:color .15s var(--ease),background .15s var(--ease)}
.cad-remove:hover{color:var(--error)}
.cad-remove.is-armed{color:#fff;background:var(--error);font-weight:500}
.cad-ponto{display:grid;grid-template-columns:1fr 120px auto;gap:8px;align-items:center}
.cad-ponto-x{width:34px;height:34px;flex-shrink:0;border:1px solid var(--border-default);background:var(--bg-surface);border-radius:9px;color:var(--text-tertiary);font-size:16px;cursor:pointer;transition:color .15s var(--ease),border-color .15s var(--ease)}
.cad-ponto-x:hover{color:var(--error);border-color:var(--error)}
.cad-add{width:100%;border:1px dashed var(--border-emphasis);background:none;color:var(--text-secondary);border-radius:10px;padding:11px;font-size:13px;font-weight:500;font-family:inherit;cursor:pointer;transition:border-color .15s var(--ease),color .15s var(--ease)}
.cad-add:hover{border-color:var(--accent);color:var(--accent)}
.cad-footnav{display:flex;gap:8px;margin-top:14px}
.cad-navbtn{border:1px solid var(--border-default);background:var(--bg-surface);color:var(--text-secondary);border-radius:10px;padding:8px 12px;font-size:13px;font-family:inherit;cursor:pointer;transition:background .15s var(--ease)}
.cad-navbtn:hover:not(:disabled){background:var(--bg-muted)}
.cad-navbtn:disabled{opacity:.4;cursor:default}
.cad-save{display:inline-flex;align-items:center;justify-content:center;gap:7px;background:var(--text-primary);color:#fff;border:none;border-radius:10px;padding:8px 18px;font-size:13px;font-weight:500;font-family:inherit;cursor:pointer;transition:background .2s var(--ease),transform .12s var(--ease)}
.cad-save:active:not(:disabled){transform:scale(.97)}
.cad-save:disabled{opacity:.75;cursor:default}
.cad-save.is-ok{background:var(--success)}
.cad-spin{width:13px;height:13px;border-radius:9999px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;animation:bxspin .6s linear infinite}
@keyframes bxspin{to{transform:rotate(360deg)}}
.cad-hidden{display:none}
.cad-up-filled{position:relative;overflow:hidden;border:1px solid var(--border-default);border-radius:10px}
.cad-up-filled img{width:100%;height:100%;object-fit:cover;display:block}
.cad-up-filled.fix{height:128px}
.cad-up-filled.is-contain{background:var(--bg-muted)}
.cad-up-filled.is-contain img{object-fit:contain}
.cad-up-ratio{position:absolute;bottom:6px;left:6px;padding:2px 6px;font-size:10px;font-weight:600;font-variant-numeric:tabular-nums;color:#fff;background:rgba(0,0,0,.55);border-radius:5px;backdrop-filter:blur(4px);pointer-events:none}
.cad-up-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:8px;background:rgba(0,0,0,.35);opacity:0;transition:opacity .15s var(--ease)}
.cad-up-filled:hover .cad-up-overlay{opacity:1}
.cad-up-btn{background:rgba(255,255,255,.92);border:none;border-radius:8px;padding:5px 10px;font-size:12px;font-weight:500;font-family:inherit;color:#1a1a1f;cursor:pointer}
.cad-up-btn.is-del{color:var(--error-fg)}
.cad-up-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;width:100%;min-height:104px;border:1.5px dashed var(--border-emphasis);background:var(--bg-canvas);border-radius:10px;color:var(--text-tertiary);font-family:inherit;cursor:pointer;transition:border-color .15s var(--ease),background .15s var(--ease),color .15s var(--ease)}
.cad-up-empty:hover{border-color:var(--text-tertiary);background:var(--bg-muted)}
.cad-up-empty.is-over{border-color:var(--accent);background:var(--accent-subtle);color:var(--accent)}
.cad-up-empty.is-wide{height:104px;min-height:0}
.cad-up-empty.fix{height:128px;min-height:0}
.cad-up-icon{width:34px;height:34px;border-radius:9px;background:var(--bg-surface);border:1px solid var(--border-default);display:grid;place-items:center;color:var(--text-tertiary);transition:color .15s var(--ease),border-color .15s var(--ease)}
.cad-up-empty:hover .cad-up-icon{color:var(--text-secondary)}
.cad-up-empty.is-over .cad-up-icon{color:var(--accent);border-color:var(--accent)}
.cad-up-main{font-size:13px;font-weight:500;color:var(--text-secondary);line-height:1}
.cad-up-empty.is-over .cad-up-main{color:var(--accent)}
.cad-up-sub{font-size:11px;color:var(--text-tertiary);line-height:1}
.cad-up-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}
.cad-up-thumb{position:relative;aspect-ratio:1;overflow:hidden;border:1px solid var(--border-default);border-radius:8px}
.cad-up-thumb img{width:100%;height:100%;object-fit:cover}
.cad-up-x{position:absolute;top:3px;right:3px;width:18px;height:18px;display:flex;align-items:center;justify-content:center;border:none;border-radius:9999px;background:rgba(0,0,0,.6);color:#fff;font-size:13px;line-height:1;cursor:pointer;opacity:0;transition:opacity .15s var(--ease)}
.cad-up-thumb:hover .cad-up-x{opacity:1}
.cad-up-n{position:absolute;bottom:0;left:0;padding:1px 5px;font-size:10px;font-weight:500;color:#fff;background:rgba(0,0,0,.45)}
.cad-up-more{display:flex;align-items:center;justify-content:center;aspect-ratio:1;border:1.5px dashed var(--border-emphasis);background:var(--bg-canvas);border-radius:8px;font-size:20px;color:var(--text-tertiary);cursor:pointer;transition:border-color .15s var(--ease),background .15s var(--ease),color .15s var(--ease)}
.cad-up-more:hover{border-color:var(--text-tertiary);color:var(--text-secondary)}
.cad-up-more.is-over{border-color:var(--accent);background:var(--accent-subtle);color:var(--accent)}
.cad-preview{position:sticky;top:118px}
.cad-preview-note{font-size:12px;line-height:1.5;color:var(--text-tertiary);margin:12px 2px 0}
.cad-pcard{background:var(--bg-surface);border:1px solid var(--border-default);border-radius:14px;overflow:hidden;box-shadow:var(--shadow-md)}
.cad-pcard-img{position:relative;height:160px;background:var(--bg-muted)}
.cad-pcard-img img{width:100%;height:100%;object-fit:cover}
.cad-pcard-ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--text-tertiary)}
.cad-pcard-status{position:absolute;top:10px;left:10px;padding:3px 8px;font-size:10px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#fff;background:rgba(0,0,0,.55);border-radius:6px;backdrop-filter:blur(4px)}
.cad-pcard-linha{position:absolute;top:10px;right:10px;padding:3px 8px;font-size:10px;font-weight:600;color:#fff;border-radius:6px}
.cad-pcard-body{padding:14px 16px 16px}
.cad-pcard-nome{font-family:var(--font-display);font-size:15px;font-weight:600;letter-spacing:-0.012em;margin:0;color:var(--text-primary)}
.cad-pcard-sub{font-size:12px;color:var(--text-secondary);margin:3px 0 0;line-height:1.4}
.cad-pcard-loc{font-size:12px;color:var(--text-tertiary);margin:8px 0 0}
.cad-pcard-meta{display:flex;flex-wrap:wrap;gap:14px;margin-top:10px;padding-top:10px;border-top:1px solid var(--border-default);font-size:12px;color:var(--text-secondary);font-variant-numeric:tabular-nums}
.cad-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--text-primary);color:#fff;border-radius:10px;padding:10px 16px;font-size:13px;font-weight:500;box-shadow:var(--shadow-lg);animation:bxup .3s var(--ease-spring);z-index:50}
.cad-footer{margin-top:40px;border-top:1px solid var(--border-default);background:var(--bg-surface)}
.cad-footer-inner{max-width:1040px;margin:0 auto;padding:24px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
.cad-footer-brand{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.cad-footer-copy{font-size:12px;color:var(--text-tertiary)}
.cad-footer-links{display:flex;gap:18px;flex-wrap:wrap}
.cad-footer-links a{font-size:13px;color:var(--text-secondary);text-decoration:none;transition:color .15s var(--ease)}
.cad-footer-links a:hover{color:var(--accent)}
@keyframes bxup{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}
@media(max-width:880px){.cad-body{grid-template-columns:1fr}.cad-preview{position:static;order:-1}.cad-pcard-img{height:140px}}
@media(max-width:560px){.cad-grid-2,.cad-grid-3,.cad-grid-media,.cad-grid-planta,.cad-grid-loc,.cad-grid-loc2{grid-template-columns:1fr}.cad-grid-4{grid-template-columns:1fr 1fr}.cad-header-inner,.cad-tabs,.cad-body,.cad-topnav,.cad-footer-inner{padding-left:16px;padding-right:16px}.cad-savestate,.cad-crumb{display:none}.cad-footer-inner{flex-direction:column;align-items:flex-start}.cad-navlink{padding:6px 9px}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;
