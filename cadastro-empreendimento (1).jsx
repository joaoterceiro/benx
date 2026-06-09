import React, { useState, useRef, useMemo, useEffect } from "react";

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
const statusLabel = (v) => STATUS_OBRA.find((s) => s.value === v)?.label ?? "";

export default function CadastroEmpreendimento() {
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
    setTimeout(() => setEstado("idle"), 2600);
  };

  const idx = TABS.findIndex((t) => t.id === tab);
  const prev = TABS[idx - 1], next = TABS[idx + 1];
  const cidadesSugeridas = CIDADES_EXISTENTES.filter((c) => !form.estado || c.uf === form.estado).map((c) => c.nome);
  const bairrosSugeridos = BAIRROS_EXISTENTES[form.cidade] || [];

  return (
    <div style={tokens}>
      <style>{CSS}</style>
      <div className="bx-root">
        <header className="bx-header">
          <nav className="bx-topnav">
            <div className="bx-topnav-left">
              <span className="bx-brand">Benx</span>
              <span className="bx-crumb">/ Empreendimentos / <strong>Novo</strong></span>
            </div>
            <div className="bx-topnav-right">
              <a className="bx-navlink" href={`/${form.linhaProduto || "empreendimentos"}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                Ver empreendimentos
              </a>
            </div>
          </nav>
          <div className="bx-header-inner">
            <div className="bx-header-title">
              <h1 className="bx-h1">{form.nome || "Novo empreendimento"}</h1>
              <div className="bx-header-sub">
                {(() => { const l = LINHA_PRODUTO.find((x) => x.value === form.linhaProduto); return l ? <span className="bx-eco" style={{ color: l.cor, background: l.bg }}>Ecossistema {l.label}</span> : null; })()}
                <span className="bx-slug">{form.slug ? `/${form.linhaProduto || "empreendimentos"}/${form.slug}` : "preencha o nome para gerar o endereço"}</span>
              </div>
            </div>
            <div className="bx-header-actions">
              <SaveState dirty={dirty} salvoUmaVez={salvoUmaVez} estado={estado} />
              <div className="bx-progress-wrap" title={`${completude}% preenchido`}>
                <svg width="34" height="34" viewBox="0 0 34 34" className="bx-ring">
                  <circle cx="17" cy="17" r="14" className="bx-ring-bg" />
                  <circle cx="17" cy="17" r="14" className="bx-ring-fg" style={{ strokeDasharray: 88, strokeDashoffset: 88 - (88 * completude) / 100 }} />
                </svg>
                <span className="bx-progress-num">{completude}</span>
              </div>
              <BotaoSalvar estado={estado} onClick={salvar} />
            </div>
          </div>
          <div className="bx-tabs">
            {TABS.map((t) => {
              const ativa = tab === t.id;
              const temErro = algumTocado && errosPorTab[t.id];
              const completa = tabCompleta[t.id] && !temErro;
              const badge = t.id === "midias" ? totalMidias : t.id === "plantas" ? plantas.length : 0;
              return (
                <button key={t.id} onClick={() => setTab(t.id)} className={`bx-tab ${ativa ? "is-active" : ""}`}>
                  {t.label}
                  {badge > 0 && <span className="bx-tab-badge">{badge}</span>}
                  {temErro ? <span className="bx-tab-dot" /> : completa ? <span className="bx-tab-check">✓</span> : null}
                </button>
              );
            })}
          </div>
        </header>

        <div className="bx-body">
          <main className="bx-form">
            <p className="bx-tab-desc">{TABS[idx]?.desc}</p>
            <div className="bx-card">

              {tab === "basico" && (
                <div className="bx-stack">
                  <Campo label="Nome do empreendimento" required hint="Aparece como título da página e gera o endereço (URL)." erro={tocado.nome && erros.nome}>
                    <input className="bx-inp" value={form.nome} onChange={(e) => set("nome", e.target.value)} onBlur={() => tocar("nome")} placeholder="PVN Corporate Boutique" data-invalid={tocado.nome && !!erros.nome} />
                  </Campo>
                  <Campo label="Subtítulo / slogan" hint="Frase curta exibida abaixo do nome no topo da página.">
                    <input className="bx-inp" value={form.subtitulo} onChange={(e) => set("subtitulo", e.target.value)} placeholder="Pronto para morar no coração do Itaim" />
                  </Campo>
                  <Campo label="Linha do produto" required hint="Vertente Benx. Define posicionamento, selo e filtro na busca." erro={tocado.linhaProduto && erros.linhaProduto}>
                    <div className="bx-grid-3">
                      {LINHA_PRODUTO.map((l) => (
                        <button key={l.value} onClick={() => { set("linhaProduto", l.value); tocar("linhaProduto"); }} className={`bx-linha ${form.linhaProduto === l.value ? "is-active" : ""}`} style={form.linhaProduto === l.value ? { borderColor: l.cor, background: l.bg } : {}}>
                          <span className="bx-linha-nome" style={form.linhaProduto === l.value ? { color: l.cor } : {}}>{l.label}</span>
                          <span className="bx-linha-nota">{l.nota}</span>
                        </button>
                      ))}
                    </div>
                  </Campo>
                  <Grupo titulo="Situação">
                    <div className="bx-grid-2">
                      <Campo label="Tipo" hint="Filtro em que o empreendimento aparece."><Select value={form.tipo} onChange={(v) => set("tipo", v)} options={TIPO} /></Campo>
                      <Campo label="Tipo de habitação" hint="Programa habitacional, quando aplicável."><Select value={form.tipoHabitacao} onChange={(v) => set("tipoHabitacao", v)} options={TIPO_HABITACAO} placeholder="Não se aplica" /></Campo>
                      <Campo label="Status da obra" hint="Estágio atual. Vira selo e filtro."><Select value={form.statusObra} onChange={(v) => set("statusObra", v)} options={STATUS_OBRA} /></Campo>
                      <Campo label="Previsão de entrega" hint="Mês e ano estimados."><input type="month" className="bx-inp" value={form.previsaoEntrega} onChange={(e) => set("previsaoEntrega", e.target.value)} /></Campo>
                    </div>
                  </Grupo>
                  <Grupo titulo="O projeto">
                    <Campo label="Descrição do projeto" hint="Texto de apresentação exibido na seção 'O Projeto'.">
                      <textarea className="bx-inp" rows={4} value={form.oProjeto} onChange={(e) => set("oProjeto", e.target.value)} placeholder="Projeto corporativo idealizado e desenvolvido pela RBR Asset Management, com foco em sofisticação e flexibilidade." />
                    </Campo>
                    <div className="bx-grid-3">
                      <Campo label="Arquitetura"><input className="bx-inp" value={form.arquitetura} onChange={(e) => set("arquitetura", e.target.value)} placeholder="Jonas Birger Arquitetura" /></Campo>
                      <Campo label="Paisagismo"><input className="bx-inp" value={form.paisagismo} onChange={(e) => set("paisagismo", e.target.value)} placeholder="Roberto Riscala" /></Campo>
                      <Campo label="Interiores"><input className="bx-inp" value={form.interiores} onChange={(e) => set("interiores", e.target.value)} placeholder="Mantesso Arquitetura" /></Campo>
                    </div>
                  </Grupo>
                </div>
              )}

              {tab === "midias" && (
                <div className="bx-stack">
                  <div className="bx-grid-media">
                    <Campo label="Imagem principal" hint="Foto de destaque: vira o fundo do topo e a imagem do projeto."><UploadSingle valor={imagemPrincipal} onChange={setImagemPrincipal} ratio="16 / 9" proporcao="16:9" /></Campo>
                    <Campo label="Logotipo" hint="Logo em PNG com fundo transparente."><UploadSingle valor={logotipo} onChange={setLogotipo} alto contain formato="PNG transparente" proporcao="livre" /></Campo>
                  </div>
                  <Grupo titulo="Galerias">
                    <Campo label="Fachada (carrossel)" hint="3 a 6 imagens recomendadas."><UploadMulti itens={galeriaFachada} onChange={setGaleriaFachada} proporcao="16:9" /></Campo>
                  </Grupo>
                  <Grupo titulo="Vídeos e tours">
                    <div className="bx-grid-2">
                      <Campo label="Vídeo principal" hint="Link YouTube/Vimeo."><input className="bx-inp" value={form.urlVideoPrincipal} onChange={(e) => set("urlVideoPrincipal", e.target.value)} placeholder="https://youtube.com/..." /></Campo>
                      <Campo label="Tour virtual" hint="Link do tour 360°."><input className="bx-inp" value={form.urlTourVirtual} onChange={(e) => set("urlTourVirtual", e.target.value)} placeholder="https://..." /></Campo>
                    </div>
                    <Campo label="Vistas do andar" hint="Link da ferramenta de vistas por andar."><input className="bx-inp" value={form.vistasDoAndar} onChange={(e) => set("vistasDoAndar", e.target.value)} placeholder="https://..." /></Campo>
                  </Grupo>
                </div>
              )}

              {tab === "caracteristicas" && (
                <div className="bx-stack">
                  <Grupo titulo="Números">
                    <div className="bx-grid-3">
                      <Campo label="Unidades"><input className="bx-inp" value={form.totalUnidades} onChange={(e) => set("totalUnidades", e.target.value)} inputMode="numeric" placeholder="68" /></Campo>
                      <Campo label="Andares"><input className="bx-inp" value={form.totalAndares} onChange={(e) => set("totalAndares", e.target.value)} inputMode="numeric" placeholder="12" /></Campo>
                      <Campo label="Unidades por andar"><input className="bx-inp" value={form.unidadesPorAndar} onChange={(e) => set("unidadesPorAndar", e.target.value)} inputMode="numeric" placeholder="1" /></Campo>
                      <Campo label="Torres"><input className="bx-inp" value={form.numeroTorres} onChange={(e) => set("numeroTorres", e.target.value)} inputMode="numeric" placeholder="1" /></Campo>
                      <Campo label="Área do terreno"><input className="bx-inp" value={form.areaTerreno} onChange={(e) => set("areaTerreno", e.target.value)} placeholder="4.790 m²" /></Campo>
                      <Campo label="Área construída"><input className="bx-inp" value={form.areaConstruida} onChange={(e) => set("areaConstruida", e.target.value)} placeholder="m²" /></Campo>
                      <Campo label="Metragem"><input className="bx-inp" value={form.metragem} onChange={(e) => set("metragem", e.target.value)} placeholder="537 a 536 m²" /></Campo>
                      <Campo label="Quartos"><input className="bx-inp" value={form.quartos} onChange={(e) => set("quartos", e.target.value)} placeholder="2 e 3" /></Campo>
                      <Campo label="Vagas"><input className="bx-inp" value={form.vagas} onChange={(e) => set("vagas", e.target.value)} placeholder="1 e 2" /></Campo>
                    </div>
                  </Grupo>
                  <Grupo titulo="Diferenciais">
                    <Campo label="Diferenciais" hint="Um por linha. Lista simples das áreas comuns.">
                      <textarea className="bx-inp" rows={5} value={form.diferenciais} onChange={(e) => set("diferenciais", e.target.value)} placeholder={"Carregadores para carros elétricos\nSistema BMS\nAr-condicionado central VRF"} />
                      <Contador texto={form.diferenciais} unidade="diferenciais" />
                    </Campo>
                  </Grupo>
                  <Grupo titulo="Áreas comuns">
                    {areasComuns.map((a, i) => (
                      <div key={a.uid} className="bx-item">
                        <div className="bx-item-head">
                          <span className="bx-micro">Área {i + 1}{a.nome.trim() ? ` · ${a.nome}` : ""}</span>
                          {areasComuns.length > 1 && <BotaoRemover onConfirm={() => removeArea(a.uid)} />}
                        </div>
                        <div className="bx-grid-planta">
                          <div className="bx-stack-sm">
                            <Campo label="Nome da área" hint="Como aparece na seção de áreas comuns."><input className="bx-inp" value={a.nome} onChange={(e) => setArea(a.uid, "nome", e.target.value)} placeholder="Rooftop com jardim" /></Campo>
                            <Campo label="Descrição" hint="Texto curto de apoio (opcional)."><textarea className="bx-inp" rows={3} value={a.descricao} onChange={(e) => setArea(a.uid, "descricao", e.target.value)} placeholder="Área de lazer no topo do edifício, com vista para a cidade." /></Campo>
                          </div>
                          <Campo label="Imagem"><UploadSingle valor={a.imagem} onChange={(img) => setArea(a.uid, "imagem", img)} ratio="4 / 3" proporcao="4:3" /></Campo>
                        </div>
                      </div>
                    ))}
                    <button onClick={addArea} className="bx-add">+ Adicionar área comum</button>
                  </Grupo>
                  <Grupo titulo="Certificações">
                    {certificacoes.length === 0 && <p className="bx-help">Nenhuma certificação. Adicione selos como LEED, AQUA, etc.</p>}
                    {certificacoes.map((c, i) => (
                      <div key={c.uid} className="bx-item">
                        <div className="bx-item-head">
                          <span className="bx-micro">Certificação {i + 1}{c.nome.trim() ? ` · ${c.nome}` : ""}</span>
                          <BotaoRemover onConfirm={() => removeCert(c.uid)} />
                        </div>
                        <div className="bx-grid-planta">
                          <Campo label="Nome"><input className="bx-inp" value={c.nome} onChange={(e) => setCert(c.uid, "nome", e.target.value)} placeholder="LEED Gold" /></Campo>
                          <Campo label="Selo"><UploadSingle valor={c.imagem} onChange={(img) => setCert(c.uid, "imagem", img)} alto contain formato="PNG transparente" proporcao="livre" /></Campo>
                        </div>
                      </div>
                    ))}
                    <button onClick={addCert} className="bx-add">+ Adicionar certificação</button>
                  </Grupo>
                  <Grupo titulo="Texto legal">
                    <Campo label="Texto legal do empreendimento" hint="Disclaimer jurídico exibido no rodapé da página (memorial, condições de venda, registro).">
                      <textarea className="bx-inp" rows={4} value={form.textoLegal} onChange={(e) => set("textoLegal", e.target.value)} placeholder="As unidades são vendidas Core & Shell. Imagens meramente ilustrativas. Empreendimento registrado sob nº ... no Cartório de Registro de Imóveis." />
                    </Campo>
                  </Grupo>
                </div>
              )}

              {tab === "localizacao" && (
                <div className="bx-stack">
                  <Campo label="CEP" hint="Digite o CEP para preencher endereço, bairro, cidade e estado automaticamente." erro={tocado.cep && erros.cep}>
                    <div className="bx-cep">
                      <input className="bx-inp" value={form.cep}
                        onChange={(e) => { set("cep", e.target.value); setCepStatus("idle"); }}
                        onBlur={(e) => { tocar("cep"); buscarCep(e.target.value); }}
                        placeholder="00000-000" inputMode="numeric" data-invalid={tocado.cep && !!erros.cep} />
                      {cepStatus === "buscando" && <span className="bx-cep-tag is-busy"><span className="bx-spin-sm" />buscando</span>}
                      {cepStatus === "ok" && <span className="bx-cep-tag is-ok">✓ preenchido</span>}
                      {cepStatus === "erro" && <span className="bx-cep-tag is-err">não encontrado, preencha manualmente</span>}
                    </div>
                  </Campo>
                  <Campo label="Endereço completo" hint="Logradouro, número e complemento."><input className="bx-inp" value={form.enderecoCompleto} onChange={(e) => set("enderecoCompleto", e.target.value)} placeholder="Av. Brigadeiro Faria Lima, 339" /></Campo>
                  <Campo label="Endereço parcial" hint="Versão curta para exibição pública (ex.: só a avenida e o bairro)."><input className="bx-inp" value={form.enderecoParcial} onChange={(e) => set("enderecoParcial", e.target.value)} placeholder="Av. Brigadeiro Faria Lima, Itaim" /></Campo>
                  <div className="bx-grid-loc2">
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
                  <Campo label="Stand de vendas" hint="Endereço do plantão, se diferente."><input className="bx-inp" value={form.standDeVendas} onChange={(e) => set("standDeVendas", e.target.value)} /></Campo>
                  <Campo label="Endereço de vendas" hint="Endereço para o link de compra/contato, se aplicável."><input className="bx-inp" value={form.enderecoVendas} onChange={(e) => set("enderecoVendas", e.target.value)} /></Campo>
                  <Grupo titulo="Links de compartilhamento">
                    <div className="bx-grid-3">
                      <Campo label="Google Maps" erro={tocado.linkMaps && erros.linkMaps}><input className="bx-inp" value={form.linkMaps} onChange={(e) => set("linkMaps", e.target.value)} onBlur={() => tocar("linkMaps")} placeholder="https://maps.google.com/..." data-invalid={tocado.linkMaps && !!erros.linkMaps} /></Campo>
                      <Campo label="Uber"><input className="bx-inp" value={form.linkUber} onChange={(e) => set("linkUber", e.target.value)} placeholder="https://m.uber.com/..." /></Campo>
                      <Campo label="Waze"><input className="bx-inp" value={form.linkWaze} onChange={(e) => set("linkWaze", e.target.value)} placeholder="https://waze.com/ul/..." /></Campo>
                    </div>
                  </Grupo>
                  <Grupo titulo="Pontos de interesse próximos">
                    {pontos.map((p, i) => (
                      <div key={p.uid} className="bx-ponto">
                        <input className="bx-inp" value={p.nome} onChange={(e) => setPonto(p.uid, "nome", e.target.value)} placeholder="Shopping JK Iguatemi" />
                        <input className="bx-inp" value={p.distancia} onChange={(e) => setPonto(p.uid, "distancia", e.target.value)} placeholder="4.400 m" />
                        {pontos.length > 1 && <button onClick={() => removePonto(p.uid)} className="bx-ponto-x" title="Remover">×</button>}
                      </div>
                    ))}
                    <button onClick={addPonto} className="bx-add">+ Adicionar ponto</button>
                  </Grupo>
                </div>
              )}

              {tab === "obra" && (
                <div className="bx-stack">
                  <p className="bx-help">Defina o avanço de cada etapa. Os percentuais alimentam a barra de andamento na página pública.</p>
                  <Slider label="Fundação" value={form.obraFundacao} onChange={(v) => set("obraFundacao", v)} />
                  <Slider label="Alvenaria" value={form.obraAlvenaria} onChange={(v) => set("obraAlvenaria", v)} />
                  <Slider label="Acabamento" value={form.obraAcabamento} onChange={(v) => set("obraAcabamento", v)} />
                  <Slider label="Total da obra" value={form.obraTotal} onChange={(v) => set("obraTotal", v)} />
                  <div className="bx-grid-2">
                    <Campo label="Documentação" hint="Situação da documentação (ex.: Aprovada)."><input className="bx-inp" value={form.obraDocumentacao} onChange={(e) => set("obraDocumentacao", e.target.value)} placeholder="Aprovada" /></Campo>
                    <Campo label="Data de atualização" hint="Quando os percentuais foram atualizados."><input type="date" className="bx-inp" value={form.obraAtualizadaEm} onChange={(e) => set("obraAtualizadaEm", e.target.value)} /></Campo>
                  </div>
                  <Campo label="Galeria de imagens da obra" hint="Registro do canteiro. Atualize a cada avanço."><UploadMulti itens={galeriaObra} onChange={setGaleriaObra} proporcao="4:3" /></Campo>
                </div>
              )}

              {tab === "plantas" && (
                <div className="bx-stack">
                  {plantas.map((p, i) => (
                    <div key={p.uid} className="bx-item">
                      <div className="bx-item-head">
                        <span className="bx-micro">Planta {i + 1}{p.nome.trim() ? ` · ${p.nome}` : ""}</span>
                        {plantas.length > 1 && <BotaoRemover onConfirm={() => removePlanta(p.uid)} />}
                      </div>
                      <div className="bx-grid-planta">
                        <div className="bx-stack-sm">
                          <Campo label="Nome da tipologia" hint="Como aparece na lista de plantas."><input className="bx-inp" value={p.nome} onChange={(e) => setPlanta(p.uid, "nome", e.target.value)} placeholder="Tipo 1 — 2 dorms com suíte" /></Campo>
                          <div className="bx-grid-4">
                            <Campo label="Metragem"><input className="bx-inp" value={p.metragem} onChange={(e) => setPlanta(p.uid, "metragem", e.target.value)} placeholder="m²" inputMode="numeric" /></Campo>
                            <Campo label="Dorms"><input className="bx-inp" value={p.dormitorios} onChange={(e) => setPlanta(p.uid, "dormitorios", e.target.value)} inputMode="numeric" /></Campo>
                            <Campo label="Suítes"><input className="bx-inp" value={p.suites} onChange={(e) => setPlanta(p.uid, "suites", e.target.value)} inputMode="numeric" /></Campo>
                            <Campo label="Vagas"><input className="bx-inp" value={p.vagas} onChange={(e) => setPlanta(p.uid, "vagas", e.target.value)} inputMode="numeric" /></Campo>
                          </div>
                        </div>
                        <Campo label="Imagem"><UploadSingle valor={p.imagem} onChange={(img) => setPlanta(p.uid, "imagem", img)} ratio="4 / 3" proporcao="4:3" /></Campo>
                      </div>
                      <Campo label="Recursos" hint="Um por linha."><textarea className="bx-inp" rows={2} value={p.recursos} onChange={(e) => setPlanta(p.uid, "recursos", e.target.value)} placeholder={"Varanda gourmet\nLavabo"} /></Campo>
                    </div>
                  ))}
                  <button onClick={addPlanta} className="bx-add">+ Adicionar planta</button>
                </div>
              )}

              {tab === "visibilidade" && (
                <div>
                  <p className="bx-help" style={{ marginBottom: 4 }}>Controle quais seções aparecem na página pública.</p>
                  <Switch label="Visível no site" hint="Desligado, fica oculto da busca e do site." checked={form.visivel} onChange={(v) => set("visivel", v)} />
                  <Switch label="Exibir andamento de obras" hint="Mostra a barra de etapas e a galeria." checked={form.exibirObras} onChange={(v) => set("exibirObras", v)} />
                  <Switch label="Exibir plantas na página" hint="Mostra a seção de tipologias." checked={form.exibirPlantas} onChange={(v) => set("exibirPlantas", v)} />
                  <Switch label="Exibir localização" hint="Mostra o mapa e os endereços." checked={form.exibirLocalizacao} onChange={(v) => set("exibirLocalizacao", v)} />
                  <Switch label="Modo breve lançamento" hint="Exibe teaser de pré-lançamento." checked={form.modoBreveLancamento} onChange={(v) => set("modoBreveLancamento", v)} ultimo />
                  <div style={{ marginTop: 16 }}>
                    <Campo label="Redirecionar para outra página" hint="Opcional. Se preenchido, a página deste empreendimento redireciona para esta URL.">
                      <input className="bx-inp" value={form.redirecionarPara} onChange={(e) => set("redirecionarPara", e.target.value)} placeholder="https://... (deixe vazio para não redirecionar)" />
                    </Campo>
                  </div>
                </div>
              )}
            </div>

            <div className="bx-footnav">
              <button disabled={!prev} onClick={() => prev && setTab(prev.id)} className="bx-navbtn">← {prev?.label ?? ""}</button>
              <button disabled={!next} onClick={() => next && setTab(next.id)} className="bx-navbtn">{next?.label ?? ""} →</button>
            </div>
          </main>

          <aside className="bx-preview">
            <span className="bx-micro" style={{ marginBottom: 10, display: "block" }}>Pré-visualização do card</span>
            <CardPreview form={form} imagem={imagemPrincipal} plantas={plantas} areas={areasComuns} />
            <p className="bx-preview-note">Como o empreendimento aparece na listagem e na busca. Atualiza enquanto você preenche.</p>
          </aside>
        </div>

        <footer className="bx-footer">
          <div className="bx-footer-inner">
            <div className="bx-footer-brand">
              <span className="bx-brand">Benx</span>
              <span className="bx-footer-copy">© {new Date().getFullYear()} Benx Incorporadora. Painel de gestão de empreendimentos.</span>
            </div>
            <nav className="bx-footer-links">
              <a href={`/${form.linhaProduto || "empreendimentos"}`}>Empreendimentos</a>
              <a href="/plantas">Plantas</a>
              <a href="/relatorios">Relatórios</a>
              <a href="/ajuda">Ajuda</a>
            </nav>
          </div>
        </footer>

        {estado === "sucesso" && <div className="bx-toast">Empreendimento salvo com sucesso</div>}
      </div>
    </div>
  );
}

// ── Indicador de estado de salvamento ───────────────────────────────────
function SaveState({ dirty, salvoUmaVez, estado }) {
  if (estado === "salvando") return null;
  if (dirty) return <span className="bx-savestate is-dirty"><span className="bx-dot" />Não salvo</span>;
  if (salvoUmaVez) return <span className="bx-savestate is-ok"><span className="bx-dot" />Salvo</span>;
  return null;
}

function CardPreview({ form, imagem, plantas, areas }) {
  const linha = LINHA_PRODUTO.find((l) => l.value === form.linhaProduto);
  const nPlantas = plantas.filter((p) => p.nome.trim()).length;
  const nAreas = (areas || []).filter((a) => a.nome.trim()).length;
  return (
    <div className="bx-pcard">
      <div className="bx-pcard-img">
        {imagem ? <img src={imagem.url} alt="" /> : <div className="bx-pcard-ph">sem imagem</div>}
        {form.statusObra && <span className="bx-pcard-status">{statusLabel(form.statusObra)}</span>}
        {linha && <span className="bx-pcard-linha" style={{ background: linha.cor }}>{linha.label}</span>}
      </div>
      <div className="bx-pcard-body">
        <p className="bx-pcard-nome">{form.nome || "Nome do empreendimento"}</p>
        {form.subtitulo && <p className="bx-pcard-sub">{form.subtitulo}</p>}
        <p className="bx-pcard-loc">{[form.bairro, form.cidade, form.estado].filter(Boolean).join(", ") || "Bairro, Cidade"}</p>
        <div className="bx-pcard-meta">
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
    <button onClick={onClick} disabled={salvando} className={`bx-save ${sucesso ? "is-ok" : ""}`}>
      {salvando && <span className="bx-spin" />}
      {sucesso ? "Salvo ✓" : salvando ? "Salvando" : "Salvar"}
    </button>
  );
}

// confirmação em dois toques
function BotaoRemover({ onConfirm }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => { if (armed) { const t = setTimeout(() => setArmed(false), 3000); return () => clearTimeout(t); } }, [armed]);
  return (
    <button className={`bx-remove ${armed ? "is-armed" : ""}`} onClick={() => (armed ? onConfirm() : setArmed(true))}>
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
    <div className="bx-combo">
      <input className="bx-inp" value={q} placeholder={placeholder}
        onChange={(e) => { setQ(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)} />
      {podeMostrar && (
        <div className="bx-combo-pop">
          {filtered.map((o) => (
            <button key={o} className="bx-combo-opt" onMouseDown={(e) => { e.preventDefault(); commit(o); }}>
              <span>{o}</span><span className="bx-combo-tag">salvo</span>
            </button>
          ))}
          {q.trim() && !exact && (
            <button className="bx-combo-opt is-create" onMouseDown={(e) => { e.preventDefault(); commit(q.trim()); }}>
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
    <div className="bx-grupo">
      <div className="bx-grupo-head"><span className="bx-micro">{titulo}</span><span className="bx-grupo-line" /></div>
      <div className="bx-stack-sm">{children}</div>
    </div>
  );
}
function Campo({ label, hint, erro, required, children }) {
  return (
    <div className="bx-field">
      <div className="bx-field-label">{label}{required && <span className="bx-req">*</span>}</div>
      {children}
      {erro ? <p className="bx-err">{erro}</p> : hint ? <p className="bx-hint">{hint}</p> : null}
    </div>
  );
}
function Select({ value, onChange, options, placeholder }) {
  return (
    <select className="bx-inp bx-select" value={value} onChange={(e) => onChange(e.target.value)}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
function Contador({ texto, unidade }) {
  const n = texto.split("\n").map((s) => s.trim()).filter(Boolean).length;
  return <p className="bx-hint" style={{ fontVariantNumeric: "tabular-nums" }}>{n} {unidade}</p>;
}
function Slider({ label, value, onChange }) {
  return (
    <div>
      <div className="bx-slider-head"><span className="bx-field-label" style={{ marginBottom: 0 }}>{label}</span><span className="bx-slider-val" style={{ color: value > 0 ? "var(--accent)" : "var(--text-tertiary)" }}>{value}%</span></div>
      <input type="range" min="0" max="100" value={value} onChange={(e) => onChange(Number(e.target.value))} className="bx-range" />
    </div>
  );
}
function Switch({ label, hint, checked, onChange, ultimo }) {
  return (
    <div className="bx-switch" style={ultimo ? { borderBottom: "none" } : {}}>
      <div><p className="bx-switch-label">{label}</p>{hint && <p className="bx-hint" style={{ marginTop: 2 }}>{hint}</p>}</div>
      <button onClick={() => onChange(!checked)} role="switch" aria-checked={checked} className={`bx-toggle ${checked ? "is-on" : ""}`}><span className="bx-toggle-dot" /></button>
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
      <input ref={ref} type="file" accept="image/*" className="bx-hidden" onChange={pick} />
      {valor ? (
        <div className={`bx-up-filled ${fix ? "fix" : ""} ${contain ? "is-contain" : ""}`} style={style}>
          <img src={valor.url} alt="" />
          {proporcao && <span className="bx-up-ratio">{proporcao}</span>}
          <div className="bx-up-overlay"><button onClick={() => ref.current?.click()} className="bx-up-btn">Trocar</button><button onClick={() => onChange(null)} className="bx-up-btn is-del">Remover</button></div>
        </div>
      ) : (
        <button onClick={() => ref.current?.click()} onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={drop} className={`bx-up-empty ${fix ? "fix" : ""} ${over ? "is-over" : ""}`} style={style}>
          <span className="bx-up-icon"><IconFoto /></span>
          <span className="bx-up-main">{over ? "Solte a imagem" : "Arraste ou clique"}</span>
          <span className="bx-up-sub">{sub}</span>
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
      <input ref={ref} type="file" accept="image/*" multiple className="bx-hidden" onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
      {itens.length === 0 ? (
        <button onClick={() => ref.current?.click()} onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={drop} className={`bx-up-empty is-wide ${over ? "is-over" : ""}`}>
          <span className="bx-up-icon"><IconFoto /></span>
          <span className="bx-up-main">{over ? "Solte as imagens" : "Arraste imagens ou clique"}</span>
          <span className="bx-up-sub">{sub}</span>
        </button>
      ) : (
        <div className="bx-up-grid">
          {itens.map((img, i) => (
            <div key={img.uid} className="bx-up-thumb">
              <img src={img.url} alt="" /><button onClick={() => remove(img.uid)} className="bx-up-x">×</button><span className="bx-up-n">{i + 1}</span>
            </div>
          ))}
          <button onClick={() => ref.current?.click()} onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={drop} className={`bx-up-more ${over ? "is-over" : ""}`}>+</button>
        </div>
      )}
      {itens.length > 0 && <p className="bx-hint" style={{ fontVariantNumeric: "tabular-nums" }}>{itens.length} imagem(ns){proporcao ? ` · ${proporcao}` : ""} · arraste mais no "+"</p>}
    </div>
  );
}

const tokens = {
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

const CSS = `
.bx-root{min-height:100vh;background:var(--bg-canvas);color:var(--text-primary);font-family:var(--font-body);font-size:14px;-webkit-font-smoothing:antialiased;letter-spacing:-0.003em}
.bx-header{position:sticky;top:0;z-index:30;background:rgba(251,251,253,0.85);backdrop-filter:saturate(180%) blur(12px);-webkit-backdrop-filter:saturate(180%) blur(12px);border-bottom:1px solid var(--border-default)}
.bx-topnav{max-width:1040px;margin:0 auto;padding:0 24px;height:46px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border-subtle,rgba(20,20,30,0.05))}
.bx-topnav-left{display:flex;align-items:center;gap:12px;min-width:0}
.bx-brand{font-family:var(--font-display);font-size:15px;font-weight:700;letter-spacing:-0.02em;color:var(--text-primary)}
.bx-crumb{font-size:12px;color:var(--text-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bx-crumb strong{color:var(--text-secondary);font-weight:600}
.bx-topnav-right{display:flex;align-items:center;gap:8px}
.bx-navlink{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:500;color:var(--text-secondary);text-decoration:none;padding:6px 11px;border:1px solid var(--border-default);border-radius:9px;background:var(--bg-surface);transition:background .15s var(--ease),color .15s var(--ease),border-color .15s var(--ease)}
.bx-navlink:hover{background:var(--bg-muted);color:var(--text-primary);border-color:var(--border-emphasis)}
.bx-header-inner{max-width:1040px;margin:0 auto;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px}
.bx-header-title{min-width:0}
.bx-h1{font-family:var(--font-display);font-size:19px;font-weight:600;letter-spacing:-0.018em;line-height:1.2;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bx-slug{font-family:var(--font-mono);font-size:11px;color:var(--text-tertiary);margin:3px 0 0}
.bx-header-sub{display:flex;align-items:center;gap:8px;margin-top:4px;flex-wrap:wrap}
.bx-header-sub .bx-slug{margin:0}
.bx-eco{font-size:11px;font-weight:600;padding:2px 8px;border-radius:9999px;white-space:nowrap}
.bx-header-actions{display:flex;align-items:center;gap:12px}
.bx-savestate{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:500;padding:3px 9px;border-radius:9999px}
.bx-savestate .bx-dot{width:6px;height:6px;border-radius:9999px}
.bx-savestate.is-dirty{color:var(--warning);background:var(--warning-bg)}
.bx-savestate.is-dirty .bx-dot{background:var(--warning)}
.bx-savestate.is-ok{color:var(--success);background:rgba(46,158,84,0.10)}
.bx-savestate.is-ok .bx-dot{background:var(--success)}
.bx-progress-wrap{position:relative;width:34px;height:34px;display:grid;place-items:center}
.bx-ring{transform:rotate(-90deg)}
.bx-ring-bg{fill:none;stroke:var(--border-default);stroke-width:3}
.bx-ring-fg{fill:none;stroke:var(--accent);stroke-width:3;stroke-linecap:round;transition:stroke-dashoffset var(--ease) .4s}
.bx-progress-num{position:absolute;font-size:10px;font-weight:600;font-variant-numeric:tabular-nums}
.bx-tabs{max-width:1040px;margin:0 auto;padding:0 24px;display:flex;gap:2px;overflow-x:auto;scrollbar-width:none}
.bx-tabs::-webkit-scrollbar{display:none}
.bx-tab{position:relative;white-space:nowrap;padding:9px 12px 11px;font-size:13px;font-weight:500;color:var(--text-tertiary);background:none;border:none;cursor:pointer;transition:color .15s var(--ease);display:inline-flex;align-items:center;gap:6px}
.bx-tab:hover{color:var(--text-secondary)}
.bx-tab.is-active{color:var(--text-primary)}
.bx-tab.is-active::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:2px;border-radius:2px;background:var(--accent)}
.bx-tab-badge{font-size:11px;font-weight:600;font-variant-numeric:tabular-nums;background:var(--bg-muted);color:var(--text-secondary);border-radius:9999px;padding:0 6px;line-height:16px}
.bx-tab-dot{width:6px;height:6px;border-radius:9999px;background:var(--error)}
.bx-tab-check{font-size:10px;font-weight:700;color:var(--success);line-height:1}
.bx-body{max-width:1040px;margin:0 auto;padding:24px;display:grid;grid-template-columns:1fr 300px;gap:24px;align-items:start}
.bx-form{min-width:0}
.bx-tab-desc{font-size:13px;color:var(--text-secondary);margin:0 0 14px}
.bx-card{background:var(--bg-surface);border:1px solid var(--border-default);border-radius:14px;padding:24px;box-shadow:var(--shadow-xs)}
.bx-stack{display:flex;flex-direction:column;gap:20px}
.bx-stack-sm{display:flex;flex-direction:column;gap:14px}
.bx-grupo{display:flex;flex-direction:column;gap:14px}
.bx-grupo-head{display:flex;align-items:center;gap:10px}
.bx-grupo-line{flex:1;height:1px;background:var(--border-default)}
.bx-micro{font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-tertiary)}
.bx-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.bx-grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
.bx-grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.bx-grid-media{display:grid;grid-template-columns:2fr 1fr;gap:16px}
.bx-grid-planta{display:grid;grid-template-columns:2fr 1fr;gap:16px}
.bx-grid-loc{display:grid;grid-template-columns:80px 1fr 1fr 120px;gap:12px}
.bx-grid-loc2{display:grid;grid-template-columns:80px 1fr 1fr;gap:12px}
.bx-cep{display:flex;align-items:center;gap:10px}
.bx-cep .bx-inp{max-width:160px}
.bx-cep-tag{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:500}
.bx-cep-tag.is-busy{color:var(--text-secondary)}
.bx-cep-tag.is-ok{color:var(--success)}
.bx-cep-tag.is-err{color:var(--warning)}
.bx-spin-sm{width:11px;height:11px;border-radius:9999px;border:2px solid var(--border-emphasis);border-top-color:var(--text-secondary);animation:bxspin .6s linear infinite}
.bx-field-label{font-size:13px;font-weight:500;color:var(--text-primary);margin-bottom:6px;display:flex;align-items:baseline;gap:3px}
.bx-req{color:var(--error)}
.bx-hint{font-size:12px;line-height:1.4;color:var(--text-tertiary);margin:6px 0 0}
.bx-err{font-size:12px;line-height:1.4;color:var(--error-fg);margin:6px 0 0}
.bx-help{font-size:13px;color:var(--text-secondary);margin:0}
.bx-inp{width:100%;border:1px solid var(--border-default);background:var(--bg-surface);color:var(--text-primary);border-radius:10px;padding:9px 12px;font-size:14px;font-family:inherit;outline:none;transition:border-color .15s var(--ease),box-shadow .15s var(--ease)}
.bx-inp::placeholder{color:var(--text-tertiary);opacity:.55}
.bx-inp:focus-visible{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-subtle)}
.bx-inp[data-invalid="true"]{border-color:var(--error)}
.bx-inp[data-invalid="true"]:focus-visible{box-shadow:0 0 0 3px rgba(229,72,77,0.12)}
textarea.bx-inp{resize:vertical;line-height:1.5}
.bx-select{appearance:none;cursor:pointer}
.bx-combo{position:relative}
.bx-combo-pop{position:absolute;z-index:20;left:0;right:0;top:calc(100% + 4px);background:var(--bg-surface);border:1px solid var(--border-default);border-radius:10px;box-shadow:var(--shadow-lg);padding:4px;max-height:200px;overflow-y:auto;animation:bxpop .12s var(--ease)}
.bx-combo-opt{display:flex;align-items:center;justify-content:space-between;width:100%;text-align:left;padding:7px 9px;border:none;background:none;border-radius:7px;font-size:13px;font-family:inherit;color:var(--text-primary);cursor:pointer;transition:background .1s var(--ease)}
.bx-combo-opt:hover{background:var(--bg-muted)}
.bx-combo-opt.is-create{color:var(--accent);font-weight:500}
.bx-combo-tag{font-size:10px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-tertiary)}
@keyframes bxpop{from{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:translateY(0)}}
.bx-linha{text-align:left;border:1px solid var(--border-default);background:var(--bg-surface);border-radius:10px;padding:10px 12px;cursor:pointer;transition:border-color .15s var(--ease),background .15s var(--ease)}
.bx-linha:hover{border-color:var(--border-emphasis)}
.bx-linha-nome{display:block;font-size:13px;font-weight:600;color:var(--text-primary)}
.bx-linha-nota{display:block;font-size:11px;color:var(--text-tertiary);margin-top:2px}
.bx-slider-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.bx-slider-val{font-family:var(--font-mono);font-size:13px;font-weight:600;font-variant-numeric:tabular-nums}
.bx-range{width:100%;accent-color:var(--accent);cursor:pointer}
.bx-switch{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:11px 0;border-bottom:1px solid var(--border-default)}
.bx-switch-label{font-size:13px;font-weight:500;color:var(--text-primary);margin:0}
.bx-toggle{position:relative;width:36px;height:20px;flex-shrink:0;margin-top:2px;border:none;border-radius:9999px;background:var(--border-emphasis);cursor:pointer;transition:background .2s var(--ease)}
.bx-toggle.is-on{background:var(--accent)}
.bx-toggle-dot{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:9999px;background:#fff;box-shadow:var(--shadow-xs);transition:left .2s var(--ease-spring)}
.bx-toggle.is-on .bx-toggle-dot{left:18px}
.bx-item{background:var(--bg-canvas);border:1px solid var(--border-default);border-radius:12px;padding:16px;animation:bxitem .25s var(--ease)}
@keyframes bxitem{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
.bx-item-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px}
.bx-item-head .bx-micro{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bx-remove{flex-shrink:0;font-size:12px;color:var(--text-tertiary);background:none;border:none;cursor:pointer;border-radius:6px;padding:3px 7px;transition:color .15s var(--ease),background .15s var(--ease)}
.bx-remove:hover{color:var(--error)}
.bx-remove.is-armed{color:#fff;background:var(--error);font-weight:500}
.bx-ponto{display:grid;grid-template-columns:1fr 120px auto;gap:8px;align-items:center}
.bx-ponto-x{width:34px;height:34px;flex-shrink:0;border:1px solid var(--border-default);background:var(--bg-surface);border-radius:9px;color:var(--text-tertiary);font-size:16px;cursor:pointer;transition:color .15s var(--ease),border-color .15s var(--ease)}
.bx-ponto-x:hover{color:var(--error);border-color:var(--error)}
.bx-add{width:100%;border:1px dashed var(--border-emphasis);background:none;color:var(--text-secondary);border-radius:10px;padding:11px;font-size:13px;font-weight:500;font-family:inherit;cursor:pointer;transition:border-color .15s var(--ease),color .15s var(--ease)}
.bx-add:hover{border-color:var(--accent);color:var(--accent)}
.bx-footnav{display:flex;gap:8px;margin-top:14px}
.bx-navbtn{border:1px solid var(--border-default);background:var(--bg-surface);color:var(--text-secondary);border-radius:10px;padding:8px 12px;font-size:13px;font-family:inherit;cursor:pointer;transition:background .15s var(--ease)}
.bx-navbtn:hover:not(:disabled){background:var(--bg-muted)}
.bx-navbtn:disabled{opacity:.4;cursor:default}
.bx-save{display:inline-flex;align-items:center;justify-content:center;gap:7px;background:var(--text-primary);color:#fff;border:none;border-radius:10px;padding:8px 18px;font-size:13px;font-weight:500;font-family:inherit;cursor:pointer;transition:background .2s var(--ease),transform .12s var(--ease)}
.bx-save:active:not(:disabled){transform:scale(.97)}
.bx-save:disabled{opacity:.75;cursor:default}
.bx-save.is-ok{background:var(--success)}
.bx-spin{width:13px;height:13px;border-radius:9999px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;animation:bxspin .6s linear infinite}
@keyframes bxspin{to{transform:rotate(360deg)}}
.bx-hidden{display:none}
.bx-up-filled{position:relative;overflow:hidden;border:1px solid var(--border-default);border-radius:10px}
.bx-up-filled img{width:100%;height:100%;object-fit:cover;display:block}
.bx-up-filled.fix{height:128px}
.bx-up-filled.is-contain{background:var(--bg-muted)}
.bx-up-filled.is-contain img{object-fit:contain}
.bx-up-ratio{position:absolute;bottom:6px;left:6px;padding:2px 6px;font-size:10px;font-weight:600;font-variant-numeric:tabular-nums;color:#fff;background:rgba(0,0,0,.55);border-radius:5px;backdrop-filter:blur(4px);pointer-events:none}
.bx-up-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:8px;background:rgba(0,0,0,.35);opacity:0;transition:opacity .15s var(--ease)}
.bx-up-filled:hover .bx-up-overlay{opacity:1}
.bx-up-btn{background:rgba(255,255,255,.92);border:none;border-radius:8px;padding:5px 10px;font-size:12px;font-weight:500;font-family:inherit;color:#1a1a1f;cursor:pointer}
.bx-up-btn.is-del{color:var(--error-fg)}
.bx-up-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;width:100%;min-height:104px;border:1.5px dashed var(--border-emphasis);background:var(--bg-canvas);border-radius:10px;color:var(--text-tertiary);font-family:inherit;cursor:pointer;transition:border-color .15s var(--ease),background .15s var(--ease),color .15s var(--ease)}
.bx-up-empty:hover{border-color:var(--text-tertiary);background:var(--bg-muted)}
.bx-up-empty.is-over{border-color:var(--accent);background:var(--accent-subtle);color:var(--accent)}
.bx-up-empty.is-wide{height:104px;min-height:0}
.bx-up-empty.fix{height:128px;min-height:0}
.bx-up-icon{width:34px;height:34px;border-radius:9px;background:var(--bg-surface);border:1px solid var(--border-default);display:grid;place-items:center;color:var(--text-tertiary);transition:color .15s var(--ease),border-color .15s var(--ease)}
.bx-up-empty:hover .bx-up-icon{color:var(--text-secondary)}
.bx-up-empty.is-over .bx-up-icon{color:var(--accent);border-color:var(--accent)}
.bx-up-main{font-size:13px;font-weight:500;color:var(--text-secondary);line-height:1}
.bx-up-empty.is-over .bx-up-main{color:var(--accent)}
.bx-up-sub{font-size:11px;color:var(--text-tertiary);line-height:1}
.bx-up-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}
.bx-up-thumb{position:relative;aspect-ratio:1;overflow:hidden;border:1px solid var(--border-default);border-radius:8px}
.bx-up-thumb img{width:100%;height:100%;object-fit:cover}
.bx-up-x{position:absolute;top:3px;right:3px;width:18px;height:18px;display:flex;align-items:center;justify-content:center;border:none;border-radius:9999px;background:rgba(0,0,0,.6);color:#fff;font-size:13px;line-height:1;cursor:pointer;opacity:0;transition:opacity .15s var(--ease)}
.bx-up-thumb:hover .bx-up-x{opacity:1}
.bx-up-n{position:absolute;bottom:0;left:0;padding:1px 5px;font-size:10px;font-weight:500;color:#fff;background:rgba(0,0,0,.45)}
.bx-up-more{display:flex;align-items:center;justify-content:center;aspect-ratio:1;border:1.5px dashed var(--border-emphasis);background:var(--bg-canvas);border-radius:8px;font-size:20px;color:var(--text-tertiary);cursor:pointer;transition:border-color .15s var(--ease),background .15s var(--ease),color .15s var(--ease)}
.bx-up-more:hover{border-color:var(--text-tertiary);color:var(--text-secondary)}
.bx-up-more.is-over{border-color:var(--accent);background:var(--accent-subtle);color:var(--accent)}
.bx-preview{position:sticky;top:170px}
.bx-preview-note{font-size:12px;line-height:1.5;color:var(--text-tertiary);margin:12px 2px 0}
.bx-pcard{background:var(--bg-surface);border:1px solid var(--border-default);border-radius:14px;overflow:hidden;box-shadow:var(--shadow-md)}
.bx-pcard-img{position:relative;height:160px;background:var(--bg-muted)}
.bx-pcard-img img{width:100%;height:100%;object-fit:cover}
.bx-pcard-ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--text-tertiary)}
.bx-pcard-status{position:absolute;top:10px;left:10px;padding:3px 8px;font-size:10px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#fff;background:rgba(0,0,0,.55);border-radius:6px;backdrop-filter:blur(4px)}
.bx-pcard-linha{position:absolute;top:10px;right:10px;padding:3px 8px;font-size:10px;font-weight:600;color:#fff;border-radius:6px}
.bx-pcard-body{padding:14px 16px 16px}
.bx-pcard-nome{font-family:var(--font-display);font-size:15px;font-weight:600;letter-spacing:-0.012em;margin:0;color:var(--text-primary)}
.bx-pcard-sub{font-size:12px;color:var(--text-secondary);margin:3px 0 0;line-height:1.4}
.bx-pcard-loc{font-size:12px;color:var(--text-tertiary);margin:8px 0 0}
.bx-pcard-meta{display:flex;flex-wrap:wrap;gap:14px;margin-top:10px;padding-top:10px;border-top:1px solid var(--border-default);font-size:12px;color:var(--text-secondary);font-variant-numeric:tabular-nums}
.bx-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--text-primary);color:#fff;border-radius:10px;padding:10px 16px;font-size:13px;font-weight:500;box-shadow:var(--shadow-lg);animation:bxup .3s var(--ease-spring);z-index:50}
.bx-footer{margin-top:40px;border-top:1px solid var(--border-default);background:var(--bg-surface)}
.bx-footer-inner{max-width:1040px;margin:0 auto;padding:24px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
.bx-footer-brand{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.bx-footer-copy{font-size:12px;color:var(--text-tertiary)}
.bx-footer-links{display:flex;gap:18px;flex-wrap:wrap}
.bx-footer-links a{font-size:13px;color:var(--text-secondary);text-decoration:none;transition:color .15s var(--ease)}
.bx-footer-links a:hover{color:var(--accent)}
@keyframes bxup{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}
@media(max-width:880px){.bx-body{grid-template-columns:1fr}.bx-preview{position:static;order:-1}.bx-pcard-img{height:140px}}
@media(max-width:560px){.bx-grid-2,.bx-grid-3,.bx-grid-media,.bx-grid-planta,.bx-grid-loc,.bx-grid-loc2{grid-template-columns:1fr}.bx-grid-4{grid-template-columns:1fr 1fr}.bx-header-inner,.bx-tabs,.bx-body,.bx-topnav,.bx-footer-inner{padding-left:16px;padding-right:16px}.bx-savestate,.bx-crumb{display:none}.bx-footer-inner{flex-direction:column;align-items:flex-start}.bx-navlink{padding:6px 9px}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;
