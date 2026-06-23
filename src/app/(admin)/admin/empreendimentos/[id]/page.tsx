import { notFound } from "next/navigation";
import { randomUUID } from "node:crypto";
import {
  CadastroEmpreendimento,
  type CadastroInicial,
  type Img,
} from "@/components/admin/cadastro-empreendimento";
import {
  empreendimentoPorId,
  listarCidades,
  plantasDoEmpreendimento,
  midiasDoEmpreendimento,
  listarEmpreendimentosResumo,
} from "@/db/queries";
import { getUrl } from "@/lib/storage";

const s = (x: unknown) => (x === null || x === undefined ? "" : String(x));
const n = (x: unknown) => (x === null || x === undefined ? 0 : Number(x));

async function imgDeChave(chave: string | null | undefined): Promise<Img | null> {
  if (!chave) return null;
  return { key: chave, url: await getUrl(chave) };
}

export default async function EditarEmpreendimentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [emp, cidades, plantasDb, midias, disponiveis] = await Promise.all([
    empreendimentoPorId(id),
    listarCidades(),
    plantasDoEmpreendimento(id),
    midiasDoEmpreendimento(id),
    listarEmpreendimentosResumo(),
  ]);
  if (!emp) notFound();

  const [imagemPrincipal, logotipo] = await Promise.all([
    imgDeChave(emp.imagemPrincipal),
    imgDeChave(emp.logotipo),
  ]);

  const areasComuns = await Promise.all(
    (emp.areasComuns ?? []).map(async (a) => {
      // tolera dado legado em que a área era apenas uma string
      const raw = a as unknown;
      const obj = (typeof raw === "string" ? { nome: raw } : raw) as {
        nome?: string;
        descricao?: string;
        imagem?: string;
      };
      return {
        uid: randomUUID(),
        nome: obj.nome ?? "",
        descricao: obj.descricao ?? "",
        imagem: await imgDeChave(obj.imagem),
      };
    })
  );
  const certificacoes = await Promise.all(
    (emp.certificacoes ?? []).map(async (c) => ({
      uid: randomUUID(),
      nome: c.nome,
      imagem: await imgDeChave(c.imagem),
    }))
  );
  const pontos = (emp.detalhesLocalizacao ?? []).map((p) => ({
    uid: randomUUID(),
    // dados migrados do WP podem trazer titulo/distancia como objeto: coage p/ string
    nome: typeof p.titulo === "string" ? p.titulo : "",
    distancia: typeof p.distancia === "string" ? p.distancia : "",
  }));
  const plantas = await Promise.all(
    plantasDb.map(async (p) => ({
      uid: randomUUID(),
      nome: p.nome,
      metragem: s(p.metragem),
      dormitorios: s(p.dormitorios),
      suites: s(p.suites),
      vagas: s(p.vagas),
      recursos: (p.recursos ?? []).join("\n"),
      imagem: await imgDeChave(p.imagemPlanta),
    }))
  );
  const galeriaFachada: Img[] = midias.filter((m) => m.tipo === "fachada").map((m) => ({ key: m.chave, url: m.url }));
  const galeriaObra: Img[] = midias.filter((m) => m.tipo === "obra").map((m) => ({ key: m.chave, url: m.url }));

  const inicial: CadastroInicial = {
    form: {
      nome: emp.nome, slug: emp.slug, subtitulo: s(emp.subtitulo),
      linhaProduto: emp.linhaProduto?.slug ?? "",
      tipo: emp.categoria?.slug ?? "residencial",
      tipoHabitacao: s(emp.tipoHabitacao),
      statusObra: emp.statusObra,
      previsaoEntrega: s(emp.previsaoEntrega).slice(0, 7),
      oProjeto: s(emp.oProjeto), arquitetura: s(emp.arquitetura), paisagismo: s(emp.paisagismo), interiores: s(emp.interiores),
      totalUnidades: s(emp.totalUnidades), totalAndares: s(emp.totalAndares),
      unidadesPorAndar: s(emp.unidadesPorAndar), numeroTorres: s(emp.numeroTorres),
      areaTerreno: s(emp.areaTerreno), areaConstruida: s(emp.areaConstruidaTotal),
      metragem: s(emp.metragemResidencial), quartos: s(emp.quartos), vagas: s(emp.vagas),
      enderecoParcial: s(emp.enderecoParcial), enderecoCompleto: s(emp.enderecoCompleto), cep: s(emp.cep),
      bairro: emp.bairro?.nome ?? "", cidade: emp.cidade?.nome ?? "", estado: emp.cidade?.estado ?? "",
      enderecoVendas: s(emp.enderecoVendas), standDeVendas: s(emp.standDeVendas),
      linkMaps: s(emp.linkMaps), linkUber: s(emp.linkUber), linkWaze: s(emp.linkWaze),
      urlVideoPrincipal: s(emp.urlVideoPrincipal), urlTourVirtual: s(emp.urlTourVirtual), vistasDoAndar: s(emp.vistasDoAndar),
      obraFundacao: n(emp.obraFundacao), obraAlvenaria: n(emp.obraAlvenaria),
      obraAcabamento: n(emp.obraAcabamento), obraTotal: n(emp.obraTotal),
      obraDocumentacao: s(emp.obraDocumentacao), obraAtualizadaEm: s(emp.obraAtualizadaEm),
      visivel: emp.visivel, exibirObras: emp.exibirObras, exibirPlantas: emp.exibirPlantas,
      exibirLocalizacao: emp.exibirLocalizacao, modoBreveLancamento: emp.modoBreveLancamento,
      redirecionarPara: s(emp.redirecionarPara),
      seoTitulo: s(emp.seoTitulo), seoDescricao: s(emp.seoDescricao),
      diferenciais: (emp.diferenciais ?? []).join("\n"),
      textoLegal: s(emp.textoLegal),
    },
    relacionados: emp.relacionados ?? [],
    imagemPrincipal,
    logotipo,
    galeriaFachada,
    galeriaObra,
    areasComuns,
    certificacoes,
    pontos,
    plantas,
  };

  return (
    <CadastroEmpreendimento
      empreendimentoId={emp.id}
      inicial={inicial}
      cidadesExistentes={cidades.map((c) => ({ nome: c.nome, uf: c.estado }))}
      relacionadosDisponiveis={disponiveis.filter((d) => d.slug !== emp.slug)}
    />
  );
}
