import React, { useState, useMemo } from "react";

// ════════════════════════════════════════════════════════════════════════
// Listagem de Empreendimentos — Premium Web. Filtros + grid de cards.
// Mesmo sistema de tokens do cadastro. A vertente é filtro de 1º nível.
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
const TIPOS = [
  { value: "residencial", label: "Residencial" },
  { value: "comercial", label: "Comercial" },
];
const ORDENS = [
  { value: "recentes", label: "Mais recentes" },
  { value: "nome", label: "Nome (A-Z)" },
  { value: "unidades", label: "Mais unidades" },
];

const linhaInfo = (v) => LINHAS.find((l) => l.value === v);
const statusLabel = (v) => STATUS.find((s) => s.value === v)?.label ?? "";
const tipoLabel = (v) => TIPOS.find((t) => t.value === v)?.label ?? "";

// Mock (no projeto real vem do Postgres via query escopada pela vertente)
const EMPREENDIMENTOS = [
  { id: "1", slug: "pvn-corporate-boutique", nome: "PVN Corporate Boutique", subtitulo: "Lajes corporativas no Itaim", linha: "benx_unicos", tipo: "comercial", status: "pronto_para_morar", estado: "SP", cidade: "São Paulo", bairro: "Itaim Bibi", metragem: "537 a 1.072 m²", unidades: 68, plantas: 6, criadoEm: "2026-05-20" },
  { id: "2", slug: "jardins-haus", nome: "Jardins Haus", subtitulo: "Residencial assinado", linha: "benx_unicos", tipo: "residencial", status: "lancamento", estado: "SP", cidade: "São Paulo", bairro: "Jardins", metragem: "180 a 320 m²", unidades: 42, plantas: 4, criadoEm: "2026-05-28" },
  { id: "3", slug: "vista-pinheiros", nome: "Vista Pinheiros", subtitulo: "Studios e 1 dormitório", linha: "benx", tipo: "residencial", status: "em_construcao", estado: "SP", cidade: "São Paulo", bairro: "Pinheiros", metragem: "32 a 58 m²", unidades: 210, plantas: 5, criadoEm: "2026-04-15" },
  { id: "4", slug: "moema-square", nome: "Moema Square", subtitulo: "2 e 3 dorms com lazer completo", linha: "benx", tipo: "residencial", status: "em_construcao", estado: "SP", cidade: "São Paulo", bairro: "Moema", metragem: "65 a 98 m²", unidades: 156, plantas: 4, criadoEm: "2026-03-30" },
  { id: "5", slug: "brooklin-offices", nome: "Brooklin Offices", subtitulo: "Salas comerciais", linha: "benx", tipo: "comercial", status: "entregue", estado: "SP", cidade: "São Paulo", bairro: "Brooklin", metragem: "28 a 140 m²", unidades: 320, plantas: 7, criadoEm: "2025-11-10" },
  { id: "6", slug: "viva-campinas", nome: "Viva Campinas", subtitulo: "Apartamentos compactos", linha: "vivabenx", tipo: "residencial", status: "lancamento", estado: "SP", cidade: "Campinas", bairro: "Cambuí", metragem: "38 a 52 m²", unidades: 280, plantas: 3, criadoEm: "2026-05-12" },
  { id: "7", slug: "viva-guarulhos", nome: "Viva Guarulhos", subtitulo: "Seu primeiro apartamento", linha: "vivabenx", tipo: "residencial", status: "em_construcao", estado: "SP", cidade: "Guarulhos", bairro: "Centro", metragem: "40 a 48 m²", unidades: 340, plantas: 2, criadoEm: "2026-02-20" },
  { id: "8", slug: "viva-santo-andre", nome: "Viva Santo André", subtitulo: "Pronto para morar", linha: "vivabenx", tipo: "residencial", status: "pronto_para_morar", estado: "SP", cidade: "Santo André", bairro: "Centro", metragem: "42 a 55 m²", unidades: 198, plantas: 3, criadoEm: "2025-12-05" },
  { id: "9", slug: "leblon-signature", nome: "Leblon Signature", subtitulo: "Alto padrão à beira-mar", linha: "benx_unicos", tipo: "residencial", status: "lancamento", estado: "RJ", cidade: "Rio de Janeiro", bairro: "Leblon", metragem: "210 a 480 m²", unidades: 24, plantas: 3, criadoEm: "2026-05-30" },
  { id: "10", slug: "vila-mariana-living", nome: "Vila Mariana Living", subtitulo: "2 dorms perto do metrô", linha: "benx", tipo: "residencial", status: "lancamento", estado: "SP", cidade: "São Paulo", bairro: "Vila Mariana", metragem: "55 a 72 m²", unidades: 124, plantas: 4, criadoEm: "2026-06-01" },
];

export default function ListagemEmpreendimentos() {
  const [linha, setLinha] = useState("");
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [tipo, setTipo] = useState("");
  const [status, setStatus] = useState("");
  const [ordem, setOrdem] = useState("recentes");

  // base do ecossistema (vertente). Demais filtros operam dentro deste escopo.
  const base = useMemo(() => (linha ? EMPREENDIMENTOS.filter((e) => e.linha === linha) : EMPREENDIMENTOS), [linha]);

  // opções dinâmicas (reaproveitadas dos dados do escopo atual)
  const estadosOpts = useMemo(() => [...new Set(base.map((e) => e.estado))].sort(), [base]);
  const cidadesOpts = useMemo(() => [...new Set(base.filter((e) => !estado || e.estado === estado).map((e) => e.cidade))].sort(), [base, estado]);
  const bairrosOpts = useMemo(() => [...new Set(base.filter((e) => (!cidade || e.cidade === cidade)).map((e) => e.bairro))].sort(), [base, cidade]);

  const resultados = useMemo(() => {
    let r = base.filter((e) => {
      if (q && !e.nome.toLowerCase().includes(q.toLowerCase())) return false;
      if (estado && e.estado !== estado) return false;
      if (cidade && e.cidade !== cidade) return false;
      if (bairro && e.bairro !== bairro) return false;
      if (tipo && e.tipo !== tipo) return false;
      if (status && e.status !== status) return false;
      return true;
    });
    if (ordem === "nome") r = [...r].sort((a, b) => a.nome.localeCompare(b.nome));
    else if (ordem === "unidades") r = [...r].sort((a, b) => b.unidades - a.unidades);
    else r = [...r].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
    return r;
  }, [base, q, estado, cidade, bairro, tipo, status, ordem]);

  const filtrosAtivos = [
    q && { k: "q", label: `"${q}"`, clear: () => setQ("") },
    estado && { k: "estado", label: estado, clear: () => { setEstado(""); } },
    cidade && { k: "cidade", label: cidade, clear: () => { setCidade(""); setBairro(""); } },
    bairro && { k: "bairro", label: bairro, clear: () => setBairro("") },
    tipo && { k: "tipo", label: tipoLabel(tipo), clear: () => setTipo("") },
    status && { k: "status", label: statusLabel(status), clear: () => setStatus("") },
  ].filter(Boolean);

  const limparTudo = () => { setQ(""); setEstado(""); setCidade(""); setBairro(""); setTipo(""); setStatus(""); };
  const limparTudoEVertente = () => { limparTudo(); setLinha(""); };

  return (
    <div style={tokens}>
      <style>{CSS}</style>
      <div className="bx-root">
        <header className="bx-header">
          <nav className="bx-topnav">
            <div className="bx-topnav-left">
              <span className="bx-brand">Benx</span>
              <span className="bx-crumb">/ <strong>Empreendimentos</strong></span>
            </div>
            <a className="bx-navlink is-primary" href="/empreendimentos/novo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
              Novo empreendimento
            </a>
          </nav>
        </header>

        <div className="bx-page">
          {/* Título + contagem */}
          <div className="bx-page-head">
            <div>
              <h1 className="bx-title">Empreendimentos</h1>
              <p className="bx-sub">{resultados.length} {resultados.length === 1 ? "resultado" : "resultados"}{linha ? ` no ecossistema ${linhaInfo(linha).label}` : " em todas as vertentes"}</p>
            </div>
          </div>

          {/* Pills de vertente (filtro de 1º nível) */}
          <div className="bx-pills">
            <button className={`bx-pill ${linha === "" ? "is-active" : ""}`} onClick={() => { setLinha(""); limparTudo(); }}>Todas</button>
            {LINHAS.map((l) => (
              <button key={l.value} className={`bx-pill ${linha === l.value ? "is-active" : ""}`} onClick={() => { setLinha(l.value); setEstado(""); setCidade(""); setBairro(""); }}
                style={linha === l.value ? { borderColor: l.cor, background: l.bg, color: l.cor } : {}}>
                <span className="bx-pill-dot" style={{ background: l.cor }} />{l.label}
              </button>
            ))}
          </div>

          {/* Barra de filtros */}
          <div className="bx-filters">
            <div className="bx-search">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome..." />
              {q && <button className="bx-search-x" onClick={() => setQ("")}>×</button>}
            </div>
            <FSelect value={estado} onChange={(v) => { setEstado(v); setCidade(""); setBairro(""); }} placeholder="Estado" options={estadosOpts.map((u) => ({ value: u, label: u }))} />
            <FSelect value={cidade} onChange={(v) => { setCidade(v); setBairro(""); }} placeholder="Cidade" options={cidadesOpts.map((c) => ({ value: c, label: c }))} />
            <FSelect value={bairro} onChange={setBairro} placeholder="Bairro" options={bairrosOpts.map((b) => ({ value: b, label: b }))} disabled={!cidade && bairrosOpts.length > 12} />
            <FSelect value={tipo} onChange={setTipo} placeholder="Tipo" options={TIPOS} />
            <FSelect value={status} onChange={setStatus} placeholder="Status" options={STATUS} />
            <div className="bx-ordena">
              <span>Ordenar</span>
              <FSelect value={ordem} onChange={setOrdem} options={ORDENS} noPlaceholder />
            </div>
          </div>

          {/* Chips ativos */}
          {filtrosAtivos.length > 0 && (
            <div className="bx-chips">
              {filtrosAtivos.map((f) => (
                <button key={f.k} className="bx-chip" onClick={f.clear}>{f.label}<span className="bx-chip-x">×</span></button>
              ))}
              <button className="bx-chip-clear" onClick={limparTudo}>Limpar filtros</button>
            </div>
          )}

          {/* Grid de resultados */}
          {resultados.length > 0 ? (
            <div className="bx-grid">
              {resultados.map((e) => <Card key={e.id} e={e} />)}
            </div>
          ) : (
            <div className="bx-empty">
              <div className="bx-empty-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
              </div>
              <p className="bx-empty-title">Nenhum empreendimento encontrado</p>
              <p className="bx-empty-sub">Ajuste os filtros para ampliar a busca.</p>
              <button className="bx-empty-btn" onClick={limparTudoEVertente}>Limpar tudo</button>
            </div>
          )}
        </div>

        <footer className="bx-footer">
          <div className="bx-footer-inner">
            <div className="bx-footer-brand"><span className="bx-brand">Benx</span><span className="bx-footer-copy">© {new Date().getFullYear()} Benx Incorporadora. Painel de gestão de empreendimentos.</span></div>
            <nav className="bx-footer-links"><a href="/empreendimentos">Empreendimentos</a><a href="/plantas">Plantas</a><a href="/relatorios">Relatórios</a><a href="/ajuda">Ajuda</a></nav>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Card({ e }) {
  const l = linhaInfo(e.linha);
  return (
    <a className="bx-card" href={`/${e.linha}/${e.slug}`}>
      <div className="bx-card-img" style={{ background: `linear-gradient(135deg, ${l.bg}, var(--bg-muted))` }}>
        <svg className="bx-card-ph" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={l.cor} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01" /></svg>
        <span className="bx-card-status">{statusLabel(e.status)}</span>
        <span className="bx-card-linha" style={{ background: l.cor }}>{l.label}</span>
      </div>
      <div className="bx-card-body">
        <p className="bx-card-nome">{e.nome}</p>
        <p className="bx-card-sub">{e.subtitulo}</p>
        <p className="bx-card-loc">{e.bairro}, {e.cidade} · {e.estado}</p>
        <div className="bx-card-meta">
          <span>{e.metragem}</span>
          <span>{e.unidades} un.</span>
          <span>{tipoLabel(e.tipo)}</span>
        </div>
      </div>
    </a>
  );
}

function FSelect({ value, onChange, options, placeholder, disabled, noPlaceholder }) {
  return (
    <div className={`bx-fselect ${value ? "is-set" : ""} ${disabled ? "is-disabled" : ""}`}>
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
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
  "--bg-canvas": "#FBFBFD", "--bg-surface": "#FFFFFF", "--bg-muted": "#F4F4F6",
  "--text-primary": "#1A1A1F", "--text-secondary": "#6B6B73", "--text-tertiary": "#9B9BA3",
  "--border-default": "rgba(20,20,30,0.09)", "--border-emphasis": "rgba(20,20,30,0.15)",
  "--accent": "#0A4DCC", "--accent-subtle": "rgba(10,77,204,0.08)",
  "--shadow-xs": "0 1px 2px rgba(0,0,0,0.04), 0 1px 1px rgba(0,0,0,0.02)",
  "--shadow-md": "0 4px 12px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.03)",
  "--shadow-lg": "0 12px 32px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.04)",
  "--ease": "cubic-bezier(0.25, 1, 0.5, 1)",
};

const CSS = `
.bx-root{min-height:100vh;background:var(--bg-canvas);color:var(--text-primary);font-family:var(--font-body);font-size:14px;-webkit-font-smoothing:antialiased;letter-spacing:-0.003em}
.bx-header{position:sticky;top:0;z-index:30;background:rgba(251,251,253,0.85);backdrop-filter:saturate(180%) blur(12px);-webkit-backdrop-filter:saturate(180%) blur(12px);border-bottom:1px solid var(--border-default)}
.bx-topnav{max-width:1100px;margin:0 auto;padding:0 24px;height:54px;display:flex;align-items:center;justify-content:space-between}
.bx-topnav-left{display:flex;align-items:center;gap:12px;min-width:0}
.bx-brand{font-family:var(--font-display);font-size:15px;font-weight:700;letter-spacing:-0.02em;color:var(--text-primary)}
.bx-crumb{font-size:12px;color:var(--text-tertiary)}
.bx-crumb strong{color:var(--text-secondary);font-weight:600}
.bx-navlink{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:500;color:var(--text-secondary);text-decoration:none;padding:7px 13px;border:1px solid var(--border-default);border-radius:9px;background:var(--bg-surface);transition:all .15s var(--ease)}
.bx-navlink:hover{background:var(--bg-muted);color:var(--text-primary)}
.bx-navlink.is-primary{background:var(--text-primary);color:#fff;border-color:var(--text-primary)}
.bx-navlink.is-primary:hover{opacity:.9}
.bx-page{max-width:1100px;margin:0 auto;padding:28px 24px}
.bx-page-head{margin-bottom:18px}
.bx-title{font-family:var(--font-display);font-size:26px;font-weight:600;letter-spacing:-0.02em;margin:0}
.bx-sub{font-size:13px;color:var(--text-secondary);margin:5px 0 0}
.bx-pills{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}
.bx-pill{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:500;color:var(--text-secondary);background:var(--bg-surface);border:1px solid var(--border-default);border-radius:9999px;padding:7px 14px;cursor:pointer;transition:all .15s var(--ease)}
.bx-pill:hover{border-color:var(--border-emphasis);color:var(--text-primary)}
.bx-pill.is-active{color:var(--text-primary);font-weight:600;border-color:var(--text-primary)}
.bx-pill-dot{width:7px;height:7px;border-radius:9999px}
.bx-filters{display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding:12px;background:var(--bg-surface);border:1px solid var(--border-default);border-radius:12px;box-shadow:var(--shadow-xs)}
.bx-search{position:relative;display:flex;align-items:center;flex:1;min-width:200px}
.bx-search svg{position:absolute;left:11px;color:var(--text-tertiary);pointer-events:none}
.bx-search input{width:100%;border:1px solid var(--border-default);background:var(--bg-canvas);border-radius:9px;padding:8px 30px 8px 32px;font-size:13px;font-family:inherit;color:var(--text-primary);outline:none;transition:border-color .15s var(--ease),box-shadow .15s var(--ease)}
.bx-search input::placeholder{color:var(--text-tertiary)}
.bx-search input:focus-visible{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-subtle)}
.bx-search-x{position:absolute;right:8px;border:none;background:none;color:var(--text-tertiary);font-size:16px;cursor:pointer;line-height:1}
.bx-fselect{position:relative}
.bx-fselect select{appearance:none;border:1px solid var(--border-default);background:var(--bg-canvas);border-radius:9px;padding:8px 28px 8px 11px;font-size:13px;font-family:inherit;color:var(--text-secondary);cursor:pointer;outline:none;transition:border-color .15s var(--ease),box-shadow .15s var(--ease)}
.bx-fselect.is-set select{color:var(--text-primary);font-weight:500;border-color:var(--border-emphasis)}
.bx-fselect select:focus-visible{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-subtle)}
.bx-fselect.is-disabled{opacity:.5;pointer-events:none}
.bx-fselect-caret{position:absolute;right:9px;top:50%;transform:translateY(-50%);color:var(--text-tertiary);pointer-events:none}
.bx-ordena{display:inline-flex;align-items:center;gap:7px;margin-left:auto;font-size:12px;color:var(--text-tertiary);white-space:nowrap}
.bx-chips{display:flex;gap:7px;flex-wrap:wrap;align-items:center;margin-top:12px}
.bx-chip{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:500;color:var(--text-primary);background:var(--bg-surface);border:1px solid var(--border-emphasis);border-radius:9999px;padding:4px 6px 4px 11px;cursor:pointer;transition:background .15s var(--ease)}
.bx-chip:hover{background:var(--bg-muted)}
.bx-chip-x{display:grid;place-items:center;width:15px;height:15px;border-radius:9999px;background:var(--bg-muted);font-size:12px;line-height:1}
.bx-chip-clear{font-size:12px;color:var(--accent);background:none;border:none;cursor:pointer;padding:4px 6px;font-weight:500}
.bx-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:20px}
.bx-card{display:flex;flex-direction:column;background:var(--bg-surface);border:1px solid var(--border-default);border-radius:14px;overflow:hidden;text-decoration:none;box-shadow:var(--shadow-xs);transition:transform .18s var(--ease),box-shadow .18s var(--ease),border-color .18s var(--ease)}
.bx-card:hover{transform:translateY(-3px);box-shadow:var(--shadow-md);border-color:var(--border-emphasis)}
.bx-card-img{position:relative;height:150px;display:grid;place-items:center}
.bx-card-status{position:absolute;top:10px;left:10px;padding:3px 8px;font-size:10px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#fff;background:rgba(0,0,0,.55);border-radius:6px;backdrop-filter:blur(4px)}
.bx-card-linha{position:absolute;top:10px;right:10px;padding:3px 8px;font-size:10px;font-weight:600;color:#fff;border-radius:6px}
.bx-card-body{padding:14px 16px 16px}
.bx-card-nome{font-family:var(--font-display);font-size:15px;font-weight:600;letter-spacing:-0.012em;margin:0;color:var(--text-primary)}
.bx-card-sub{font-size:12px;color:var(--text-secondary);margin:3px 0 0;line-height:1.4}
.bx-card-loc{font-size:12px;color:var(--text-tertiary);margin:8px 0 0}
.bx-card-meta{display:flex;flex-wrap:wrap;gap:12px;margin-top:10px;padding-top:10px;border-top:1px solid var(--border-default);font-size:12px;color:var(--text-secondary);font-variant-numeric:tabular-nums}
.bx-empty{text-align:center;padding:64px 24px;border:1px dashed var(--border-emphasis);border-radius:14px;margin-top:20px}
.bx-empty-icon{width:44px;height:44px;margin:0 auto 14px;border-radius:11px;background:var(--bg-muted);display:grid;place-items:center;color:var(--text-tertiary)}
.bx-empty-title{font-size:15px;font-weight:600;margin:0;color:var(--text-primary)}
.bx-empty-sub{font-size:13px;color:var(--text-tertiary);margin:5px 0 16px}
.bx-empty-btn{font-size:13px;font-weight:500;color:#fff;background:var(--text-primary);border:none;border-radius:9px;padding:8px 16px;cursor:pointer;transition:opacity .15s var(--ease)}
.bx-empty-btn:hover{opacity:.9}
.bx-footer{margin-top:48px;border-top:1px solid var(--border-default);background:var(--bg-surface)}
.bx-footer-inner{max-width:1100px;margin:0 auto;padding:24px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
.bx-footer-brand{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.bx-footer-copy{font-size:12px;color:var(--text-tertiary)}
.bx-footer-links{display:flex;gap:18px;flex-wrap:wrap}
.bx-footer-links a{font-size:13px;color:var(--text-secondary);text-decoration:none;transition:color .15s var(--ease)}
.bx-footer-links a:hover{color:var(--accent)}
@media(max-width:900px){.bx-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:600px){.bx-grid{grid-template-columns:1fr}.bx-ordena{margin-left:0;width:100%}.bx-search{min-width:100%}.bx-footer-inner{flex-direction:column;align-items:flex-start}}
@media(prefers-reduced-motion:reduce){*{transition:none!important}}
`;
