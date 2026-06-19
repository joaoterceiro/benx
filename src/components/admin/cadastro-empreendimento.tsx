"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./cadastro.css";
import { salvarEmpreendimento, type SalvarPayload } from "@/actions/empreendimentos";
import { enviarImagemComProgresso } from "@/lib/upload-client";
import { humanizar } from "@/lib/labels";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

// ════════════════════════════════════════════════════════════════════════
// Cadastro de Empreendimento — porte fiel do protótipo, integrado ao backend.
// Form + preview ao vivo. Uploads vão ao MinIO na seleção; o save persiste tudo.
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
  { value: "benx_iconicos", label: "Benx Icônicos", nota: "Alto padrão", cor: "#7A5C1E", bg: "rgba(122,92,30,0.10)" },
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
const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

// ── Tipos ─────────────────────────────────────────────────────────────────
export interface Img { key: string; url: string; uploading?: boolean; progresso?: number }
interface Area { uid: string; nome: string; descricao: string; imagem: Img | null }
interface Ponto { uid: string; nome: string; distancia: string }
interface Cert { uid: string; nome: string; imagem: Img | null }
interface Planta { uid: string; nome: string; metragem: string; dormitorios: string; suites: string; vagas: string; recursos: string; imagem: Img | null }

export interface CadastroInicial {
  form?: Record<string, unknown>;
  imagemPrincipal?: Img | null;
  logotipo?: Img | null;
  galeriaFachada?: Img[];
  galeriaObra?: Img[];
  areasComuns?: Area[];
  certificacoes?: Cert[];
  pontos?: Ponto[];
  plantas?: Planta[];
  relacionados?: string[];
}

const uid = () => crypto.randomUUID();
const novaPlanta = (): Planta => ({ uid: uid(), nome: "", metragem: "", dormitorios: "", suites: "", vagas: "", recursos: "", imagem: null });
const novaArea = (): Area => ({ uid: uid(), nome: "", descricao: "", imagem: null });
const novoPonto = (): Ponto => ({ uid: uid(), nome: "", distancia: "" });
const novaCert = (): Cert => ({ uid: uid(), nome: "", imagem: null });
const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const statusLabel = (v: string) => STATUS_OBRA.find((s) => s.value === v)?.label ?? humanizar(v);
// Token livre a partir de um rótulo digitado (ex.: "Pré-lançamento" -> "pre_lancamento").
const tokenizar = (label: string, sep: "-" | "_") =>
  label
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, sep)
    .replace(sep === "-" ? /(^-|-$)/g : /(^_|_$)/g, "");

const FORM_VAZIO: Record<string, unknown> = {
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
  redirecionarPara: "", diferenciais: "", textoLegal: "",
  seoTitulo: "", seoDescricao: "",
};

export function CadastroEmpreendimento({
  empreendimentoId: idInicial,
  inicial,
  cidadesExistentes = [],
  bairrosPorCidade = {},
  relacionadosDisponiveis = [],
}: {
  empreendimentoId?: string;
  inicial?: CadastroInicial;
  cidadesExistentes?: { nome: string; uf: string }[];
  bairrosPorCidade?: Record<string, string[]>;
  relacionadosDisponiveis?: { slug: string; nome: string }[];
}) {
  const router = useRouter();
  const [empId, setEmpId] = useState<string | null>(idInicial ?? null);
  const [tab, setTab] = useState("basico");
  const [tocado, setTocado] = useState<Record<string, boolean>>({});
  const [estado, setEstado] = useState<"idle" | "salvando" | "sucesso" | "erro">("idle");
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [cepStatus, setCepStatus] = useState<"idle" | "buscando" | "ok" | "erro">("idle");
  const [salvoUmaVez, setSalvoUmaVez] = useState(!!idInicial);
  const [form, setForm] = useState<Record<string, unknown>>({ ...FORM_VAZIO, ...(inicial?.form ?? {}) });
  const [imagemPrincipal, setImagemPrincipal] = useState<Img | null>(inicial?.imagemPrincipal ?? null);
  const [logotipo, setLogotipo] = useState<Img | null>(inicial?.logotipo ?? null);
  const [galeriaFachada, setGaleriaFachada] = useState<Img[]>(inicial?.galeriaFachada ?? []);
  const [areasComuns, setAreasComuns] = useState<Area[]>(inicial?.areasComuns?.length ? inicial.areasComuns : [novaArea()]);
  const [pontos, setPontos] = useState<Ponto[]>(inicial?.pontos?.length ? inicial.pontos : [novoPonto()]);
  const [certificacoes, setCertificacoes] = useState<Cert[]>(inicial?.certificacoes ?? []);
  const [galeriaObra, setGaleriaObra] = useState<Img[]>(inicial?.galeriaObra ?? []);
  const [plantas, setPlantas] = useState<Planta[]>(inicial?.plantas?.length ? inicial.plantas : [novaPlanta()]);
  const [relacionados, setRelacionados] = useState<string[]>(inicial?.relacionados ?? []);

  const montou = useRef(false);
  useEffect(() => {
    if (montou.current) setDirty(true);
    else montou.current = true;
  }, [form, imagemPrincipal, logotipo, galeriaFachada, areasComuns, pontos, certificacoes, galeriaObra, plantas, relacionados]);

  // Guarda de alterações não salvas: avisa antes de fechar/recarregar a aba.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const set = (campo: string, valor: unknown) =>
    setForm((f) => { const n = { ...f, [campo]: valor }; if (campo === "nome") n.slug = slugify(String(valor)); return n; });
  const v = (k: string) => (form[k] ?? "") as string;
  const tocar = (campo: string) => setTocado((t) => ({ ...t, [campo]: true }));
  const setPlanta = (u: string, c: keyof Planta, val: unknown) => setPlantas((ps) => ps.map((p) => (p.uid === u ? { ...p, [c]: val } : p)));
  const addPlanta = () => setPlantas((ps) => [...ps, novaPlanta()]);
  const removePlanta = (u: string) => setPlantas((ps) => (ps.length > 1 ? ps.filter((p) => p.uid !== u) : ps));
  const setArea = (u: string, c: keyof Area, val: unknown) => setAreasComuns((as) => as.map((a) => (a.uid === u ? { ...a, [c]: val } : a)));
  const addArea = () => setAreasComuns((as) => [...as, novaArea()]);
  const removeArea = (u: string) => setAreasComuns((as) => (as.length > 1 ? as.filter((a) => a.uid !== u) : as));
  const setPonto = (u: string, c: keyof Ponto, val: unknown) => setPontos((ps) => ps.map((p) => (p.uid === u ? { ...p, [c]: val } : p)));
  const addPonto = () => setPontos((ps) => [...ps, novoPonto()]);
  const removePonto = (u: string) => setPontos((ps) => ps.filter((p) => p.uid !== u));
  const setCert = (u: string, c: keyof Cert, val: unknown) => setCertificacoes((cs) => cs.map((x) => (x.uid === u ? { ...x, [c]: val } : x)));
  const addCert = () => setCertificacoes((cs) => [...cs, novaCert()]);
  const removeCert = (u: string) => setCertificacoes((cs) => cs.filter((x) => x.uid !== u));

  const selecionarCidade = (nome: string) => {
    const conhecida = cidadesExistentes.find((c) => c.nome.toLowerCase() === nome.trim().toLowerCase());
    setForm((f) => ({ ...f, cidade: nome, estado: conhecida ? conhecida.uf : f.estado, bairro: nome !== f.cidade ? "" : f.bairro }));
  };

  const buscarCep = async (cepRaw: string) => {
    const cep = (cepRaw || "").replace(/\D/g, "");
    if (cep.length !== 8) return;
    setCepStatus("buscando");
    try {
      const res = await fetch(`/api/cep/${cep}`);
      if (!res.ok) { setCepStatus("erro"); return; }
      const data = await res.json();
      setForm((f) => ({
        ...f,
        enderecoCompleto: data.logradouro || f.enderecoCompleto,
        bairro: data.bairro || f.bairro,
        cidade: data.localidade || f.cidade,
        estado: data.uf || f.estado,
      }));
      setCepStatus("ok");
    } catch { setCepStatus("erro"); }
  };

  const erros = useMemo(() => {
    const e: Record<string, string> = {};
    if (!v("nome").trim()) e.nome = "Dê um nome ao empreendimento.";
    if (!v("linhaProduto")) e.linhaProduto = "Selecione a vertente Benx.";
    if (v("cep") && !/^\d{5}-?\d{3}$/.test(v("cep"))) e.cep = "Use o formato 00000-000.";
    if (v("linkMaps") && !/^https?:\/\//.test(v("linkMaps"))) e.linkMaps = "Inclua https:// no link.";
    if (galeriaFachada.length < 3) e.galeriaFachada = "Adicione no mínimo 3 imagens na Fachada.";
    return e;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, galeriaFachada]);
  const errosPorTab: Record<string, boolean> = {
    basico: ["nome", "linhaProduto"].some((k) => erros[k]),
    midias: ["galeriaFachada"].some((k) => erros[k]),
    localizacao: ["cep", "linkMaps"].some((k) => erros[k]),
  };
  const algumTocado = tocado.nome || tocado.linhaProduto || tocado.cep || tocado.linkMaps || tocado.galeriaFachada || salvoUmaVez;
  const tabCompleta: Record<string, boolean> = {
    basico: !!v("nome").trim() && !!v("linhaProduto"),
    midias: !!imagemPrincipal && galeriaFachada.length >= 3,
    caracteristicas: !!v("metragem"),
    localizacao: !!v("enderecoCompleto") && !!v("cidade"),
    plantas: plantas.some((p) => p.nome.trim()),
  };
  const totalMidias = (imagemPrincipal ? 1 : 0) + (logotipo ? 1 : 0) + galeriaFachada.length + galeriaObra.length;
  const completude = useMemo(() => {
    const c = [!!v("nome").trim(), !!v("linhaProduto"), !!v("subtitulo"), !!imagemPrincipal, galeriaFachada.length > 0, !!v("metragem"), !!v("enderecoCompleto"), !!v("cidade"), plantas.some((p) => p.nome.trim())];
    return Math.round((c.filter(Boolean).length / c.length) * 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, imagemPrincipal, galeriaFachada, plantas]);

  function montarPayload(): SalvarPayload {
    const linhas = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
    return {
      nome: v("nome"), slug: v("slug"), subtitulo: v("subtitulo"),
      linhaProduto: v("linhaProduto") as SalvarPayload["linhaProduto"],
      categoriaSlug: v("tipo"),
      tipoHabitacao: (v("tipoHabitacao") || undefined) as SalvarPayload["tipoHabitacao"],
      statusObra: v("statusObra") as SalvarPayload["statusObra"],
      previsaoEntrega: v("previsaoEntrega"),
      oProjeto: v("oProjeto"), arquitetura: v("arquitetura"), paisagismo: v("paisagismo"), interiores: v("interiores"),
      totalUnidades: v("totalUnidades"), totalAndares: v("totalAndares"), unidadesPorAndar: v("unidadesPorAndar"), numeroTorres: v("numeroTorres"),
      areaTerreno: v("areaTerreno"), areaConstruidaTotal: v("areaConstruida"),
      metragemResidencial: v("metragem"), quartos: v("quartos"), vagas: v("vagas"), textoLegal: v("textoLegal"),
      enderecoParcial: v("enderecoParcial"), enderecoCompleto: v("enderecoCompleto"), cep: v("cep"),
      cidadeNome: v("cidade"), cidadeUf: v("estado"), bairroNome: v("bairro"),
      enderecoVendas: v("enderecoVendas"), standDeVendas: v("standDeVendas"),
      linkUber: v("linkUber"), linkMaps: v("linkMaps"), linkWaze: v("linkWaze"),
      imagemPrincipal: imagemPrincipal?.key ?? undefined,
      logotipo: logotipo?.key ?? undefined,
      urlVideoPrincipal: v("urlVideoPrincipal"), urlTourVirtual: v("urlTourVirtual"), vistasDoAndar: v("vistasDoAndar"),
      obraFundacao: form.obraFundacao as number, obraAlvenaria: form.obraAlvenaria as number,
      obraAcabamento: form.obraAcabamento as number, obraTotal: form.obraTotal as number,
      obraDocumentacao: v("obraDocumentacao"), obraAtualizadaEm: v("obraAtualizadaEm"),
      redirecionarPara: v("redirecionarPara"),
      seoTitulo: v("seoTitulo"), seoDescricao: v("seoDescricao"),
      visivel: form.visivel as boolean, exibirObras: form.exibirObras as boolean,
      exibirPlantas: form.exibirPlantas as boolean, exibirLocalizacao: form.exibirLocalizacao as boolean,
      modoBreveLancamento: form.modoBreveLancamento as boolean,
      diferenciais: linhas(v("diferenciais")),
      areasComuns: areasComuns.filter((a) => a.nome.trim()).map((a) => ({ nome: a.nome, descricao: a.descricao || undefined, imagem: a.imagem?.key })),
      certificacoes: certificacoes.filter((c) => c.nome.trim()).map((c) => ({ nome: c.nome, imagem: c.imagem?.key })),
      detalhesLocalizacao: pontos.filter((p) => p.nome.trim()).map((p) => ({ titulo: p.nome, distancia: p.distancia || undefined })),
      tagsCard: [],
      relacionados,
      plantas: plantas.filter((p) => p.nome.trim()).map((p) => ({
        nome: p.nome, metragem: p.metragem, dormitorios: p.dormitorios, suites: p.suites, vagas: p.vagas,
        recursos: linhas(p.recursos), imagem: p.imagem?.key ?? null,
      })),
      galeriaFachada: galeriaFachada.map((i) => i.key),
      galeriaObra: galeriaObra.map((i) => i.key),
    };
  }

  async function salvar() {
    setTocado((t) => ({ ...t, nome: true, linhaProduto: true }));
    setErroGeral(null);
    if (Object.keys(erros).length) {
      if (errosPorTab.basico) setTab("basico");
      else if (errosPorTab.midias) setTab("midias");
      else if (errosPorTab.localizacao) setTab("localizacao");
      const msg = erros.galeriaFachada
        ? "Adicione no mínimo 3 imagens na galeria de Fachada para salvar."
        : "Revise os campos obrigatórios destacados antes de salvar.";
      setErroGeral(msg);
      toast.error(msg);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setEstado("salvando");
    try {
      const r = await salvarEmpreendimento(empId, montarPayload());
      if (r.ok) {
        setEmpId(r.id);
        setEstado("sucesso");
        setDirty(false);
        setSalvoUmaVez(true);
        router.refresh();
        toast.success("Empreendimento salvo.");
        setTimeout(() => setEstado("idle"), 2600);
      } else {
        const msg = r.erro || "Não foi possível salvar. Tente novamente.";
        setEstado("erro");
        setErroGeral(msg);
        toast.error(msg);
        if (r.campos?.nome || r.campos?.linhaProduto) setTab("basico");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (e) {
      setEstado("erro");
      setErroGeral("Erro inesperado ao salvar. Verifique a sua conexão e tente novamente.");
      toast.error("Erro ao salvar. Tente novamente.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      console.error("Falha ao salvar empreendimento:", e);
    }
  }

  const idx = TABS.findIndex((t) => t.id === tab);
  const prev = TABS[idx - 1], next = TABS[idx + 1];
  const cidadesSugeridas = cidadesExistentes.filter((c) => !v("estado") || c.uf === v("estado")).map((c) => c.nome);
  const bairrosSugeridos = bairrosPorCidade[v("cidade")] || [];

  return (
    <div className="bx-root">
      <header className="bx-header">
        <div className="bx-header-inner">
          <div className="bx-header-title">
            <h1 className="bx-h1">{v("nome") || "Novo empreendimento"}</h1>
            <div className="bx-header-sub">
              {(() => { const l = LINHA_PRODUTO.find((x) => x.value === v("linhaProduto")); return l ? <span className="bx-eco" style={{ color: l.cor, background: l.bg }}>Ecossistema {l.label}</span> : null; })()}
              <span className="bx-slug">{v("slug") ? `/${slugRota(v("linhaProduto"))}/${v("slug")}` : "preencha o nome para gerar o endereço"}</span>
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
            const temErro = !!algumTocado && errosPorTab[t.id];
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
          {erroGeral ? (
            <div role="alert" style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14, padding: "12px 14px", borderRadius: 10, background: "rgba(225,29,42,0.10)", border: "1px solid rgba(225,29,42,0.35)" }}>
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1, color: "#F2555A" }} />
              <span style={{ fontSize: 13, lineHeight: 1.5, color: "#f3b0b3" }}>{erroGeral}</span>
            </div>
          ) : null}
          <div className="bx-card">

            {tab === "basico" && (
              <div className="bx-stack">
                <Campo label="Nome do empreendimento" required hint="Aparece como título da página e gera o endereço (URL)." erro={tocado.nome && erros.nome}>
                  <input className="bx-inp" value={v("nome")} onChange={(e) => set("nome", e.target.value)} onBlur={() => tocar("nome")} placeholder="PVN Corporate Boutique" data-invalid={tocado.nome && !!erros.nome} />
                </Campo>
                <Campo label="Subtítulo / slogan" hint="Frase curta exibida abaixo do nome no topo da página.">
                  <input className="bx-inp" value={v("subtitulo")} onChange={(e) => set("subtitulo", e.target.value)} placeholder="Pronto para morar no coração do Itaim" />
                </Campo>
                <Campo label="Linha do produto" required hint="Vertente Benx. Define posicionamento, selo e filtro na busca." erro={tocado.linhaProduto && erros.linhaProduto}>
                  <div className="bx-grid-3">
                    {LINHA_PRODUTO.map((l) => (
                      <button key={l.value} onClick={() => { set("linhaProduto", l.value); tocar("linhaProduto"); }} className={`bx-linha ${v("linhaProduto") === l.value ? "is-active" : ""}`} style={v("linhaProduto") === l.value ? { borderColor: l.cor, background: l.bg } : {}}>
                        <span className="bx-linha-nome" style={v("linhaProduto") === l.value ? { color: l.cor } : {}}>{l.label}</span>
                        <span className="bx-linha-nota">{l.nota}</span>
                      </button>
                    ))}
                  </div>
                </Campo>
                <Grupo titulo="Situação">
                  <div className="bx-grid-2">
                    <Campo label="Tipo" hint="Filtro em que o empreendimento aparece."><SelectCriavel value={v("tipo")} onChange={(val) => set("tipo", val)} options={TIPO} sep="-" addLabel="Cadastrar outro tipo…" /></Campo>
                    <Campo label="Tipo de habitação" hint="Programa habitacional, quando aplicável."><SelectCriavel value={v("tipoHabitacao")} onChange={(val) => set("tipoHabitacao", val)} options={TIPO_HABITACAO} placeholder="Não se aplica" addLabel="Cadastrar outra…" /></Campo>
                    <Campo label="Status da obra" hint="Estágio atual. Vira selo e filtro."><SelectCriavel value={v("statusObra")} onChange={(val) => set("statusObra", val)} options={STATUS_OBRA} addLabel="Cadastrar outro status…" /></Campo>
                    <Campo label="Previsão de entrega" hint="Mês e ano estimados."><input type="month" className="bx-inp" value={v("previsaoEntrega")} onChange={(e) => set("previsaoEntrega", e.target.value)} /></Campo>
                  </div>
                </Grupo>
                <Grupo titulo="O projeto">
                  <Campo label="Descrição do projeto" hint="Texto de apresentação exibido na seção 'O Projeto'.">
                    <textarea className="bx-inp" rows={4} value={v("oProjeto")} onChange={(e) => set("oProjeto", e.target.value)} placeholder="Projeto idealizado com foco em sofisticação e flexibilidade." />
                  </Campo>
                  <div className="bx-grid-3">
                    <Campo label="Arquitetura"><input className="bx-inp" value={v("arquitetura")} onChange={(e) => set("arquitetura", e.target.value)} placeholder="Jonas Birger Arquitetura" /></Campo>
                    <Campo label="Paisagismo"><input className="bx-inp" value={v("paisagismo")} onChange={(e) => set("paisagismo", e.target.value)} placeholder="Roberto Riscala" /></Campo>
                    <Campo label="Interiores"><input className="bx-inp" value={v("interiores")} onChange={(e) => set("interiores", e.target.value)} placeholder="Mantesso Arquitetura" /></Campo>
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
                  <Campo label="Fachada (carrossel)" required hint="Mínimo 3 imagens (obrigatório), 3 a 6 recomendadas." erro={(tocado.galeriaFachada || salvoUmaVez) && erros.galeriaFachada}><UploadMulti itens={galeriaFachada} onChange={(v) => { setGaleriaFachada(v); tocar("galeriaFachada"); }} proporcao="16:9" /></Campo>
                </Grupo>
                <Grupo titulo="Vídeos e tours">
                  <div className="bx-grid-2">
                    <Campo label="Vídeo principal" hint="Link YouTube/Vimeo."><input className="bx-inp" value={v("urlVideoPrincipal")} onChange={(e) => set("urlVideoPrincipal", e.target.value)} placeholder="https://youtube.com/..." /></Campo>
                    <Campo label="Tour virtual" hint="Link do tour 360°."><input className="bx-inp" value={v("urlTourVirtual")} onChange={(e) => set("urlTourVirtual", e.target.value)} placeholder="https://..." /></Campo>
                  </div>
                  <Campo label="Vistas do andar" hint="Link da ferramenta de vistas por andar."><input className="bx-inp" value={v("vistasDoAndar")} onChange={(e) => set("vistasDoAndar", e.target.value)} placeholder="https://..." /></Campo>
                </Grupo>
              </div>
            )}

            {tab === "caracteristicas" && (
              <div className="bx-stack">
                <Grupo titulo="Números">
                  <div className="bx-grid-3">
                    <Campo label="Unidades"><input className="bx-inp" value={v("totalUnidades")} onChange={(e) => set("totalUnidades", e.target.value)} inputMode="numeric" placeholder="68" /></Campo>
                    <Campo label="Andares"><input className="bx-inp" value={v("totalAndares")} onChange={(e) => set("totalAndares", e.target.value)} inputMode="numeric" placeholder="12" /></Campo>
                    <Campo label="Unidades por andar"><input className="bx-inp" value={v("unidadesPorAndar")} onChange={(e) => set("unidadesPorAndar", e.target.value)} inputMode="numeric" placeholder="1" /></Campo>
                    <Campo label="Torres"><input className="bx-inp" value={v("numeroTorres")} onChange={(e) => set("numeroTorres", e.target.value)} inputMode="numeric" placeholder="1" /></Campo>
                    <Campo label="Área do terreno"><input className="bx-inp" value={v("areaTerreno")} onChange={(e) => set("areaTerreno", e.target.value)} placeholder="4.790 m²" /></Campo>
                    <Campo label="Área construída"><input className="bx-inp" value={v("areaConstruida")} onChange={(e) => set("areaConstruida", e.target.value)} placeholder="m²" /></Campo>
                    <Campo label="Metragem"><input className="bx-inp" value={v("metragem")} onChange={(e) => set("metragem", e.target.value)} placeholder="537 a 536 m²" /></Campo>
                    <Campo label="Quartos"><input className="bx-inp" value={v("quartos")} onChange={(e) => set("quartos", e.target.value)} placeholder="2 e 3" /></Campo>
                    <Campo label="Vagas"><input className="bx-inp" value={v("vagas")} onChange={(e) => set("vagas", e.target.value)} placeholder="1 e 2" /></Campo>
                  </div>
                </Grupo>
                <Grupo titulo="Diferenciais">
                  <Campo label="Diferenciais" hint="Um por linha. Lista simples das áreas comuns.">
                    <textarea className="bx-inp" rows={5} value={v("diferenciais")} onChange={(e) => set("diferenciais", e.target.value)} placeholder={"Carregadores para carros elétricos\nSistema BMS\nAr-condicionado central VRF"} />
                    <Contador texto={v("diferenciais")} unidade="diferenciais" />
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
                          <Campo label="Descrição" hint="Texto curto de apoio (opcional)."><textarea className="bx-inp" rows={3} value={a.descricao} onChange={(e) => setArea(a.uid, "descricao", e.target.value)} placeholder="Área de lazer no topo do edifício." /></Campo>
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
                  <Campo label="Texto legal do empreendimento" hint="Disclaimer jurídico exibido no rodapé da página.">
                    <textarea className="bx-inp" rows={4} value={v("textoLegal")} onChange={(e) => set("textoLegal", e.target.value)} placeholder="Imagens meramente ilustrativas. Empreendimento registrado sob nº ..." />
                  </Campo>
                </Grupo>
              </div>
            )}

            {tab === "localizacao" && (
              <div className="bx-stack">
                <Campo label="CEP" hint="Digite o CEP para preencher endereço, bairro, cidade e estado automaticamente." erro={tocado.cep && erros.cep}>
                  <div className="bx-cep">
                    <input className="bx-inp" value={v("cep")} onChange={(e) => { set("cep", e.target.value); setCepStatus("idle"); }} onBlur={(e) => { tocar("cep"); buscarCep(e.target.value); }} placeholder="00000-000" inputMode="numeric" data-invalid={tocado.cep && !!erros.cep} />
                    {cepStatus === "buscando" && <span className="bx-cep-tag is-busy"><span className="bx-spin-sm" />buscando</span>}
                    {cepStatus === "ok" && <span className="bx-cep-tag is-ok">✓ preenchido</span>}
                    {cepStatus === "erro" && <span className="bx-cep-tag is-err">não encontrado, preencha manualmente</span>}
                  </div>
                </Campo>
                <Campo label="Endereço completo" hint="Logradouro, número e complemento."><input className="bx-inp" value={v("enderecoCompleto")} onChange={(e) => set("enderecoCompleto", e.target.value)} placeholder="Av. Brigadeiro Faria Lima, 339" /></Campo>
                <Campo label="Endereço parcial" hint="Versão curta para exibição pública."><input className="bx-inp" value={v("enderecoParcial")} onChange={(e) => set("enderecoParcial", e.target.value)} placeholder="Av. Brigadeiro Faria Lima, Itaim" /></Campo>
                <div className="bx-grid-loc2">
                  <Campo label="Estado" hint="Sigla (UF)."><Select value={v("estado")} onChange={(val) => set("estado", val)} options={UFS.map((u) => ({ value: u, label: u }))} placeholder="UF" /></Campo>
                  <Campo label="Cidade" hint={cidadesSugeridas.length ? "Reaproveita cidades já cadastradas." : "Digite e use 'criar' para adicionar."}><Combobox value={v("cidade")} onChange={selecionarCidade} options={cidadesSugeridas} placeholder="São Paulo" /></Campo>
                  <Campo label="Bairro" hint={v("cidade") ? "Sugestões da cidade selecionada." : "Selecione a cidade para ver sugestões."}><Combobox value={v("bairro")} onChange={(val) => set("bairro", val)} options={bairrosSugeridos} placeholder="Itaim Bibi" /></Campo>
                </div>
                <Campo label="Stand de vendas" hint="Endereço do plantão, se diferente."><input className="bx-inp" value={v("standDeVendas")} onChange={(e) => set("standDeVendas", e.target.value)} /></Campo>
                <Campo label="Endereço de vendas" hint="Endereço para o link de compra/contato, se aplicável."><input className="bx-inp" value={v("enderecoVendas")} onChange={(e) => set("enderecoVendas", e.target.value)} /></Campo>
                <Grupo titulo="Links de compartilhamento">
                  <div className="bx-grid-3">
                    <Campo label="Google Maps" erro={tocado.linkMaps && erros.linkMaps}><input className="bx-inp" value={v("linkMaps")} onChange={(e) => set("linkMaps", e.target.value)} onBlur={() => tocar("linkMaps")} placeholder="https://maps.google.com/..." data-invalid={tocado.linkMaps && !!erros.linkMaps} /></Campo>
                    <Campo label="Uber"><input className="bx-inp" value={v("linkUber")} onChange={(e) => set("linkUber", e.target.value)} placeholder="https://m.uber.com/..." /></Campo>
                    <Campo label="Waze"><input className="bx-inp" value={v("linkWaze")} onChange={(e) => set("linkWaze", e.target.value)} placeholder="https://waze.com/ul/..." /></Campo>
                  </div>
                </Grupo>
                <Grupo titulo="Pontos de interesse próximos">
                  {pontos.map((p) => (
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
                <Slider label="Fundação" value={form.obraFundacao as number} onChange={(val) => set("obraFundacao", val)} />
                <Slider label="Alvenaria" value={form.obraAlvenaria as number} onChange={(val) => set("obraAlvenaria", val)} />
                <Slider label="Acabamento" value={form.obraAcabamento as number} onChange={(val) => set("obraAcabamento", val)} />
                <Slider label="Total da obra" value={form.obraTotal as number} onChange={(val) => set("obraTotal", val)} />
                <div className="bx-grid-2">
                  <Campo label="Documentação" hint="Situação da documentação (ex.: Aprovada)."><input className="bx-inp" value={v("obraDocumentacao")} onChange={(e) => set("obraDocumentacao", e.target.value)} placeholder="Aprovada" /></Campo>
                  <Campo label="Data de atualização" hint="Quando os percentuais foram atualizados."><input type="date" className="bx-inp" value={v("obraAtualizadaEm")} onChange={(e) => set("obraAtualizadaEm", e.target.value)} /></Campo>
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
                <Switch label="Visível no site" hint="Desligado, fica oculto da busca e do site." checked={form.visivel as boolean} onChange={(val) => set("visivel", val)} />
                <Switch label="Exibir andamento de obras" hint="Mostra a barra de etapas e a galeria." checked={form.exibirObras as boolean} onChange={(val) => set("exibirObras", val)} />
                <Switch label="Exibir plantas na página" hint="Mostra a seção de tipologias." checked={form.exibirPlantas as boolean} onChange={(val) => set("exibirPlantas", val)} />
                <Switch label="Exibir localização" hint="Mostra o mapa e os endereços." checked={form.exibirLocalizacao as boolean} onChange={(val) => set("exibirLocalizacao", val)} />
                <Switch label="Modo breve lançamento" hint="Exibe teaser de pré-lançamento." checked={form.modoBreveLancamento as boolean} onChange={(val) => set("modoBreveLancamento", val)} ultimo />
                <div style={{ marginTop: 16 }}>
                  <Campo label="Redirecionar para outra página" hint="Opcional. Se preenchido, a página deste empreendimento redireciona para esta URL.">
                    <input className="bx-inp" value={v("redirecionarPara")} onChange={(e) => set("redirecionarPara", e.target.value)} placeholder="https://... (deixe vazio para não redirecionar)" />
                  </Campo>
                </div>
                <div style={{ marginTop: 16 }}>
                  <Campo label="Empreendimentos relacionados" hint="Aparecem como sugestões na página pública.">
                    <RelacionadosEditor todos={relacionadosDisponiveis} selecionados={relacionados} onChange={setRelacionados} selfSlug={v("slug")} />
                  </Campo>
                </div>

                <div style={{ marginTop: 24, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                  <p className="bx-help" style={{ marginBottom: 8, fontWeight: 600 }}>SEO</p>
                  <Campo label="Título SEO" hint="Vazio = usa o nome do empreendimento. Ideal até 60 caracteres.">
                    <input className="bx-inp" value={v("seoTitulo")} onChange={(e) => set("seoTitulo", e.target.value)} placeholder={v("nome") || "Título para Google / compartilhamento"} />
                  </Campo>
                  <div style={{ marginTop: 12 }}>
                    <Campo label="Descrição SEO" hint="Vazio = usa o subtítulo. Ideal até 160 caracteres.">
                      <textarea className="bx-inp" rows={2} value={v("seoDescricao")} onChange={(e) => set("seoDescricao", e.target.value)} placeholder={v("subtitulo") || "Descrição para Google / compartilhamento"} />
                    </Campo>
                  </div>
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

      {estado === "sucesso" && <div className="bx-toast">Empreendimento salvo com sucesso</div>}
    </div>
  );
}

function slugRota(value: string) {
  return LINHA_PRODUTO.find((l) => l.value === value)
    ? { benx_iconicos: "iconicos", benx: "benx", vivabenx: "vivabenx" }[value] ?? value
    : "empreendimentos";
}

// ── Subcomponentes ──────────────────────────────────────────────────────
function SaveState({ dirty, salvoUmaVez, estado }: { dirty: boolean; salvoUmaVez: boolean; estado: string }) {
  if (estado === "salvando") return null;
  if (dirty) return <span className="bx-savestate is-dirty"><span className="bx-dot" />Não salvo</span>;
  if (salvoUmaVez) return <span className="bx-savestate is-ok"><span className="bx-dot" />Salvo</span>;
  return null;
}

function CardPreview({ form, imagem, plantas, areas }: { form: Record<string, unknown>; imagem: Img | null; plantas: Planta[]; areas: Area[] }) {
  const linha = LINHA_PRODUTO.find((l) => l.value === form.linhaProduto);
  const nPlantas = plantas.filter((p) => (p.nome || "").trim()).length;
  const nAreas = (areas || []).filter((a) => (a.nome || "").trim()).length;
  const g = (k: string) => (form[k] ?? "") as string;
  return (
    <div className="bx-pcard">
      <div className="bx-pcard-img">
        {imagem ? <img src={imagem.url} alt="" /> : <div className="bx-pcard-ph">sem imagem</div>}
        {form.statusObra ? <span className="bx-pcard-status">{statusLabel(String(form.statusObra))}</span> : null}
        {linha && <span className="bx-pcard-linha" style={{ background: linha.cor }}>{linha.label}</span>}
      </div>
      <div className="bx-pcard-body">
        <p className="bx-pcard-nome">{g("nome") || "Nome do empreendimento"}</p>
        {g("subtitulo") && <p className="bx-pcard-sub">{g("subtitulo")}</p>}
        <p className="bx-pcard-loc">{[g("bairro"), g("cidade"), g("estado")].filter(Boolean).join(", ") || "Bairro, Cidade"}</p>
        <div className="bx-pcard-meta">
          {g("metragem") && <span>{g("metragem")}</span>}
          {nPlantas > 0 && <span>{nPlantas} planta{nPlantas !== 1 ? "s" : ""}</span>}
          {nAreas > 0 && <span>{nAreas} área{nAreas !== 1 ? "s" : ""}</span>}
        </div>
      </div>
    </div>
  );
}

function BotaoSalvar({ estado, onClick }: { estado: string; onClick: () => void }) {
  const salvando = estado === "salvando", sucesso = estado === "sucesso", erro = estado === "erro";
  return (
    <button onClick={onClick} disabled={salvando} className={`bx-save ${sucesso ? "is-ok" : ""}`}>
      {salvando && <span className="bx-spin" />}
      {sucesso ? "Salvo ✓" : salvando ? "Salvando" : erro ? "Tentar novamente" : "Salvar"}
    </button>
  );
}

function BotaoRemover({ onConfirm }: { onConfirm: () => void }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => { if (armed) { const t = setTimeout(() => setArmed(false), 3000); return () => clearTimeout(t); } }, [armed]);
  return (
    <button className={`bx-remove ${armed ? "is-armed" : ""}`} onClick={() => (armed ? onConfirm() : setArmed(true))}>
      {armed ? "Confirmar remoção?" : "Remover"}
    </button>
  );
}

function Combobox({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: string[]; placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(value || "");
  useEffect(() => { setQ(value || ""); }, [value]);
  const filtered = options.filter((o) => o.toLowerCase().includes(q.toLowerCase()));
  const exact = options.some((o) => o.toLowerCase() === q.trim().toLowerCase());
  const commit = (val: string) => { onChange(val); setQ(val); setOpen(false); };
  const podeMostrar = open && (filtered.length > 0 || (q.trim() !== "" && !exact));
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
          {q.trim() !== "" && !exact && (
            <button className="bx-combo-opt is-create" onMouseDown={(e) => { e.preventDefault(); commit(q.trim()); }}>
              + Criar &quot;{q.trim()}&quot;
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="bx-grupo">
      <div className="bx-grupo-head"><span className="bx-micro">{titulo}</span><span className="bx-grupo-line" /></div>
      <div className="bx-stack-sm">{children}</div>
    </div>
  );
}
function Campo({ label, hint, erro, required, children }: { label: string; hint?: string; erro?: string | false; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="bx-field">
      <div className="bx-field-label">{label}{required && <span className="bx-req">*</span>}</div>
      {children}
      {erro ? <p className="bx-err">{erro}</p> : hint ? <p className="bx-hint">{hint}</p> : null}
    </div>
  );
}
function Select({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string }) {
  return (
    <select className="bx-inp bx-select" value={value} onChange={(e) => onChange(e.target.value)}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
// Dropdown custom que permite cadastrar um novo valor inline.
// Reaproveita o popover do DS (.bx-combo-*); o valor criado é um token livre.
function SelectCriavel({
  value,
  onChange,
  options,
  placeholder,
  sep = "_",
  addLabel = "Cadastrar outro…",
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  sep?: "-" | "_";
  addLabel?: string;
}) {
  const [extras, setExtras] = useState<{ value: string; label: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [criando, setCriando] = useState(false);
  const [rascunho, setRascunho] = useState("");
  const [ativo, setAtivo] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // União: base + adicionados + valor atual (se for customizado vindo do banco).
  const todas = useMemo(() => {
    const map = new Map<string, string>();
    for (const o of options) map.set(o.value, o.label);
    for (const e of extras) map.set(e.value, e.label);
    if (value && !map.has(value)) map.set(value, humanizar(value));
    return Array.from(map, ([v, l]) => ({ value: v, label: l }));
  }, [options, extras, value]);

  const selecionada = todas.find((o) => o.value === value) ?? null;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const alvo = e.target as Node;
      // Alvo já removido do DOM (re-render interno, ex.: abrir o modo criar):
      // não é clique externo, ignora para não fechar o dropdown.
      if (!document.contains(alvo)) return;
      if (wrapRef.current && !wrapRef.current.contains(alvo)) fechar();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (criando) inputRef.current?.focus();
  }, [criando]);

  function abrir() {
    setOpen(true);
    setAtivo(Math.max(0, todas.findIndex((o) => o.value === value)));
  }
  function fechar() {
    setOpen(false);
    setCriando(false);
    setRascunho("");
    setAtivo(-1);
  }
  function escolher(v: string) {
    onChange(v);
    fechar();
  }
  function confirmar() {
    const label = rascunho.trim();
    const token = tokenizar(label, sep);
    if (!label || !token) return;
    setExtras((xs) => (xs.some((x) => x.value === token) ? xs : [...xs, { value: token, label }]));
    onChange(token);
    fechar();
  }
  function onTriggerKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") return fechar();
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        abrir();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAtivo((i) => Math.min(todas.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAtivo((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (ativo >= 0 && ativo < todas.length) escolher(todas[ativo].value);
    }
  }

  return (
    <div className="bx-criavel" ref={wrapRef}>
      <button
        type="button"
        className="bx-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        data-open={open}
        onClick={() => (open ? fechar() : abrir())}
        onKeyDown={onTriggerKey}
      >
        <span className={selecionada ? "bx-trigger-val" : "bx-trigger-ph"}>
          {selecionada ? selecionada.label : placeholder ?? "Selecione"}
        </span>
        <svg className="bx-chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="bx-combo-pop" role="listbox">
          {!criando ? (
            <>
              {placeholder && (
                <button
                  type="button"
                  role="option"
                  aria-selected={!value}
                  className={`bx-combo-opt${!value ? " is-sel" : ""}`}
                  onMouseDown={(e) => { e.preventDefault(); escolher(""); }}
                >
                  <span>{placeholder}</span>
                  {!value && <Check />}
                </button>
              )}
              {todas.map((o, i) => (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  aria-selected={o.value === value}
                  className={`bx-combo-opt${o.value === value ? " is-sel" : ""}${i === ativo ? " is-active" : ""}`}
                  onMouseEnter={() => setAtivo(i)}
                  onMouseDown={(e) => { e.preventDefault(); escolher(o.value); }}
                >
                  <span>{o.label}</span>
                  {o.value === value && <Check />}
                </button>
              ))}
              <div className="bx-combo-sep" />
              <button
                type="button"
                className="bx-combo-opt is-create"
                onMouseDown={(e) => { e.preventDefault(); setCriando(true); }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>{addLabel}</span>
              </button>
            </>
          ) : (
            <div className="bx-criavel-form">
              <input
                ref={inputRef}
                className="bx-inp"
                value={rascunho}
                onChange={(e) => setRascunho(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); confirmar(); }
                  else if (e.key === "Escape") { e.preventDefault(); setCriando(false); setRascunho(""); }
                }}
                placeholder="Nome do novo valor"
              />
              <div className="bx-criavel-actions">
                <button type="button" className="bx-criavel-cancel" onClick={() => { setCriando(false); setRascunho(""); }}>Cancelar</button>
                <button type="button" className="bx-criavel-ok" onClick={confirmar} disabled={!rascunho.trim()}>Adicionar</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
function Check() {
  return (
    <svg className="bx-combo-check" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
function RelacionadosEditor({ todos, selecionados, onChange, selfSlug }: {
  todos: { slug: string; nome: string }[];
  selecionados: string[];
  onChange: (v: string[]) => void;
  selfSlug?: string;
}) {
  const nome = (slug: string) => todos.find((t) => t.slug === slug)?.nome ?? slug;
  const disponiveis = todos.filter((t) => t.slug !== selfSlug && !selecionados.includes(t.slug));
  return (
    <div className="bx-rel">
      {selecionados.length > 0 && (
        <div className="bx-rel-chips">
          {selecionados.map((s) => (
            <span key={s} className="bx-rel-chip">
              {nome(s)}
              <button type="button" onClick={() => onChange(selecionados.filter((x) => x !== s))} aria-label="Remover">×</button>
            </span>
          ))}
        </div>
      )}
      <select className="bx-inp bx-select" value="" onChange={(e) => { if (e.target.value) onChange([...selecionados, e.target.value]); }}>
        <option value="">{disponiveis.length ? "+ Adicionar relacionado…" : "Nenhum outro empreendimento disponível"}</option>
        {disponiveis.map((t) => <option key={t.slug} value={t.slug}>{t.nome}</option>)}
      </select>
    </div>
  );
}
function Contador({ texto, unidade }: { texto: string; unidade: string }) {
  const n = texto.split("\n").map((s) => s.trim()).filter(Boolean).length;
  return <p className="bx-hint" style={{ fontVariantNumeric: "tabular-nums" }}>{n} {unidade}</p>;
}
function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="bx-slider-head"><span className="bx-field-label" style={{ marginBottom: 0 }}>{label}</span><span className="bx-slider-val" style={{ color: value > 0 ? "var(--accent)" : "var(--text-tertiary)" }}>{value}%</span></div>
      <input type="range" min="0" max="100" value={value} onChange={(e) => onChange(Number(e.target.value))} className="bx-range" />
    </div>
  );
}
function Switch({ label, hint, checked, onChange, ultimo }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void; ultimo?: boolean }) {
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

// ── Uploads (vão ao MinIO na seleção; guardam a chave) ──────────────────
async function subirArquivo(file: File, onProgress?: (pct: number) => void): Promise<{ key: string } | { erro: string }> {
  try {
    const r = await enviarImagemComProgresso(file, "empreendimentos", (p) => onProgress?.(p));
    return { key: r.chave };
  } catch (e) {
    return { erro: e instanceof Error ? e.message : "Falha no upload" };
  }
}

// Barra de progresso (overlay) reutilizada pelos uploads.
function BarraProgresso({ pct }: { pct: number }) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", gap: 6, background: "rgba(0,0,0,0.45)", color: "#fff", padding: 12 }}>
      <div style={{ width: "78%", height: 6, borderRadius: 999, background: "rgba(255,255,255,0.25)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "#0049CF", transition: "width .2s ease" }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600 }}>{pct}%</span>
    </div>
  );
}

function UploadSingle({ valor, onChange, alto, ratio, contain, formato = "PNG, JPG ou WebP", proporcao }: {
  valor: Img | null; onChange: (v: Img | null) => void; alto?: boolean; ratio?: string; contain?: boolean; formato?: string; proporcao?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function processar(file: File) {
    setErro(null);
    const url = URL.createObjectURL(file);
    onChange({ key: "", url, uploading: true, progresso: 0 });
    const r = await subirArquivo(file, (p) => onChange({ key: "", url, uploading: true, progresso: p }));
    if ("key" in r) onChange({ key: r.key, url });
    else { setErro(r.erro); onChange(null); }
  }
  const pick = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) processar(f); };
  const drop = (e: React.DragEvent) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files?.[0]; if (f) processar(f); };
  const style = ratio ? { aspectRatio: ratio } : undefined;
  const fix = alto && !ratio;
  const sub = proporcao ? `${formato} · ${proporcao}` : formato;
  return (
    <div>
      <input ref={ref} type="file" accept="image/*" className="bx-hidden" onChange={pick} />
      {valor ? (
        <div className={`bx-up-filled ${fix ? "fix" : ""} ${contain ? "is-contain" : ""}`} style={style}>
          <img src={valor.url} alt="" style={valor.uploading ? { opacity: 0.6 } : undefined} />
          {proporcao && !valor.uploading && <span className="bx-up-ratio">{proporcao}</span>}
          {valor.uploading && <BarraProgresso pct={valor.progresso ?? 0} />}
          {!valor.uploading && <div className="bx-up-overlay"><button onClick={() => ref.current?.click()} className="bx-up-btn">Trocar</button><button onClick={() => onChange(null)} className="bx-up-btn is-del">Remover</button></div>}
        </div>
      ) : (
        <button onClick={() => ref.current?.click()} onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={drop} className={`bx-up-empty ${fix ? "fix" : ""} ${over ? "is-over" : ""}`} style={style}>
          <span className="bx-up-icon"><IconFoto /></span>
          <span className="bx-up-main">{over ? "Solte a imagem" : "Arraste ou clique"}</span>
          <span className="bx-up-sub">{sub}</span>
        </button>
      )}
      {erro ? <p className="bx-err">{erro}</p> : null}
    </div>
  );
}

function UploadMulti({ itens, onChange, formato = "PNG ou JPG", proporcao }: {
  itens: Img[]; onChange: (v: Img[]) => void; formato?: string; proporcao?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  // mantém a lista mais recente para uploads sequenciais (evita closure stale)
  const refAtual = useRef<Img[]>(itens);
  useEffect(() => { refAtual.current = itens; }, [itens]);

  async function add(files?: FileList | null) {
    const fs = Array.from(files ?? []);
    for (const file of fs) {
      const url = URL.createObjectURL(file);
      // Insere placeholder com barra de progresso e atualiza ao vivo.
      refAtual.current = [...refAtual.current, { key: "", url, uploading: true, progresso: 0 }];
      onChange(refAtual.current);
      const setP = (p: number) => {
        refAtual.current = refAtual.current.map((i) => (i.url === url ? { ...i, progresso: p } : i));
        onChange(refAtual.current);
      };
      const r = await subirArquivo(file, setP);
      if ("key" in r) {
        refAtual.current = refAtual.current.map((i) => (i.url === url ? { key: r.key, url } : i));
      } else {
        refAtual.current = refAtual.current.filter((i) => i.url !== url);
      }
      onChange(refAtual.current);
    }
  }

  const drop = (e: React.DragEvent) => { e.preventDefault(); setOver(false); add(e.dataTransfer.files); };
  const remove = (key: string, url: string) => onChange(itens.filter((i) => !(i.key === key && i.url === url)));
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
            <div key={img.key || img.url} className="bx-up-thumb" style={{ position: "relative" }}>
              <img src={img.url} alt="" style={img.uploading ? { opacity: 0.6 } : undefined} />
              {img.uploading ? <BarraProgresso pct={img.progresso ?? 0} /> : <><button onClick={() => remove(img.key, img.url)} className="bx-up-x">×</button><span className="bx-up-n">{i + 1}</span></>}
            </div>
          ))}
          <button onClick={() => ref.current?.click()} onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={drop} className={`bx-up-more ${over ? "is-over" : ""}`}>+</button>
        </div>
      )}
      {itens.length > 0 && <p className="bx-hint" style={{ fontVariantNumeric: "tabular-nums" }}>{itens.length} imagem(ns){proporcao ? ` · ${proporcao}` : ""} · arraste mais no &quot;+&quot;</p>}
    </div>
  );
}
