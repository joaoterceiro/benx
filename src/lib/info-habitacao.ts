// Conteúdo "Informações importantes" sobre HIS/HMP exibido (colapsável) nas
// páginas de produto Viva Benx, conforme o tipo de habitação do empreendimento.
// Texto institucional (Prefeitura de SP). HTML autorado aqui (conteúdo confiável).

export interface SecaoInfo { q: string; html: string }
export interface VarianteInfo { titulo: string; secoes: SecaoInfo[] }

// ── Trechos compartilhados entre as variantes ───────────────────────────────
const FAMILIA = `
<p>É considerada família o conjunto de uma ou mais pessoas que contribuam para a renda ou tenham suas despesas atendidas pela unidade familiar e que morem no mesmo domicílio.</p>
<p>Os adquirentes deverão apresentar documentação que demonstre o enquadramento da unidade familiar na respectiva faixa de renda, de acordo com as normas da Prefeitura Municipal, respondendo pela veracidade desta documentação.</p>`;

const INVESTIDOR = `
<h4>Investidor</h4>
<p>Está dispensado de enquadramento no limite de renda para compra, mas o imóvel somente poderá ser ocupado, mediante locação, por famílias enquadradas na faixa de renda aplicável, sendo que o aluguel não poderá ultrapassar <strong>30%</strong> da renda da família locatária.</p>
<p>Quando assinar o contrato de locação, o investidor deverá emitir certidão de enquadramento da família locatária na faixa de renda aplicável, com base na documentação de renda que lhe for apresentada, observando as normas da Prefeitura Municipal. O investidor responde pela veracidade desta documentação e deverá mantê-la arquivada para eventual fiscalização.</p>`;

const PRAZO: SecaoInfo = {
  q: "Prazo de enquadramento?",
  html: `<p>A certidão de enquadramento de renda para cada unidade será exigida em todas as revendas durante 10 anos contados da conclusão das obras (habite-se) ou, se depois, da venda realizada para uma família enquadrada. Para o caso de locação, a certidão de enquadramento de renda será exigida em todas as relocações durante 10 anos contados da locação para família enquadrada.</p>`,
};
const MATRICULA: SecaoInfo = {
  q: "A destinação do imóvel deverá ser registrada na matrícula?",
  html: `<p>Sim. É uma obrigatoriedade tanto para a compra, quanto para locação. A locação também deverá ser informada em plataforma a ser disponibilizada pela Prefeitura na internet.</p>`,
};
const COMODATO: SecaoInfo = {
  q: "Posso alugar por curta temporada ou ceder em comodato?",
  html: `<p>Não, mesmo se destinado a quem eventualmente se enquadre na faixa de renda. Caso o imóvel não seja locado ou fique desocupado, a Prefeitura poderá exigir que o proprietário comprove com contas de água, luz, internet ou outros meios que o imóvel não foi utilizado.</p>`,
};
const PENALIDADES: SecaoInfo = {
  q: "Quais são as penalidades?",
  html: `<p>As penalidades por descumprimento incluem pagamento de multas elevadas, tanto para os adquirentes e seus cessionários, quanto para investidores e locatários.</p>`,
};

const quemCompra = (moradores: string): SecaoInfo => ({
  q: "Quem pode comprar?",
  html: `<h4>Moradores</h4>${moradores}${FAMILIA}${INVESTIDOR}`,
});

// ── Variantes ───────────────────────────────────────────────────────────────
const HIS_HMP: VarianteInfo = {
  titulo: "Informações importantes sobre HIS e HMP",
  secoes: [
    { q: "O que é?", html: `<p>Unidades de Habitação de Interesse Social (HIS) e Habitação de Mercado Popular (HMP) são unidades habitacionais incentivadas pela legislação municipal, destinadas exclusivamente às famílias enquadradas na faixa de renda de cada programa.</p>` },
    quemCompra(`<ul><li><strong>Unidades HIS-2</strong>: limite de renda familiar mensal de até 6 salários-mínimos</li><li><strong>Unidades HMP</strong>: limite de renda familiar mensal de até 10 salários-mínimos</li></ul>`),
    {
      q: "Quais são os limites máximos de preço?",
      html: `<ul><li><strong>Unidades HIS-2</strong>: <strong>R$ 383.636,74</strong> (trezentos e oitenta e três mil, seiscentos e trinta e seis reais e setenta e quatro centavos)</li><li><strong>Unidades HMP</strong>: <strong>R$ 537.672,71</strong> (quinhentos e trinta e sete mil, seiscentos e setenta e dois reais e setenta e um centavos)</li></ul><p>Estes valores serão atualizados anualmente pelo INCC. As revendas de unidades por adquirentes enquadrados ou investidores também deverão observar referidos limites de preço.</p>`,
    },
    PRAZO, MATRICULA, COMODATO, PENALIDADES,
    { q: "Quais são as legislações vigentes?", html: `<p>PDE (Lei 17.975/2023), LUOS (Lei 18.081/2024), Decreto Municipal 63.130/2024, Portarias SEHAB nºs 61/2024 e 122/2025, Decreto Municipal 64.895/2026 e demais que vierem a alterá-los ou substituí-los.</p>` },
  ],
};

const HIS: VarianteInfo = {
  titulo: "Informações importantes sobre HIS",
  secoes: [
    { q: "O que é?", html: `<p>Unidades de Habitação de Interesse Social (HIS) são unidades habitacionais incentivadas pela legislação municipal, destinadas exclusivamente às famílias enquadradas na faixa de renda do programa.</p>` },
    quemCompra(`<ul><li><strong>Unidades HIS-2</strong>: limite de renda familiar de até 6 salários-mínimos</li></ul>`),
    {
      q: "Qual é o limite máximo de preço?",
      html: `<ul><li><strong>Unidades HIS-2</strong>: <strong>R$ 383.636,74</strong> (trezentos e oitenta e três mil, seiscentos e trinta e seis reais e setenta e quatro centavos)</li></ul><p>Este valor será atualizado anualmente pelo INCC. As revendas de unidades por adquirentes enquadrados ou investidores também deverão observar referido limite de preço.</p>`,
    },
    PRAZO, MATRICULA, COMODATO, PENALIDADES,
    { q: "Quais são as legislações vigentes?", html: `<p>PDE (Lei 17.975/2023), LUOS (Lei 18.081/2024), Decreto Municipal 63.130/2024, Portaria SEHAB nº 61/2024 e demais que vierem a alterá-los ou substituí-los.</p>` },
  ],
};

const HMP: VarianteInfo = {
  titulo: "Informações importantes sobre HMP",
  secoes: [
    { q: "O que é?", html: `<p>Unidades de Habitação de Mercado Popular (HMP) são unidades habitacionais incentivadas pela legislação municipal, destinadas exclusivamente às famílias enquadradas na faixa de renda do programa.</p>` },
    quemCompra(`<ul><li><strong>Unidades HMP</strong>: limite de renda familiar de até 10 salários-mínimos</li></ul>`),
    {
      q: "Qual é o limite máximo de preço?",
      html: `<ul><li><strong>Unidades HMP</strong>: <strong>R$ 537.672,71</strong> (quinhentos e trinta e sete mil, seiscentos e setenta e dois reais e setenta e um centavos)</li></ul><p>Este valor será atualizado anualmente pelo INCC. As revendas de unidades por adquirentes enquadrados ou investidores também deverão observar referido limite de preço.</p>`,
    },
    PRAZO, MATRICULA, COMODATO, PENALIDADES,
    { q: "Quais são as legislações vigentes?", html: `<p>PDE (Lei 17.975/2023), LUOS (Lei 18.081/2024), Decreto Municipal 63.130/2024, Portaria SEHAB nº 61/2024 e demais que vierem a alterá-los ou substituí-los.</p>` },
  ],
};

export type ChaveInfo = "his_hmp" | "his" | "hmp";

// Conteúdo padrão (usado como fallback quando o admin não editou ainda).
export const INFO_DEFAULTS: Record<ChaveInfo, VarianteInfo> = { his_hmp: HIS_HMP, his: HIS, hmp: HMP };

// Chaves na tabela configuracoes (uma por variante).
export const INFO_CHAVES: Record<ChaveInfo, string> = {
  his_hmp: "info_habitacao_his_hmp",
  his: "info_habitacao_his",
  hmp: "info_habitacao_hmp",
};

// Rótulos das variantes (para o admin).
export const INFO_VARIANTES: { chave: ChaveInfo; label: string }[] = [
  { chave: "his_hmp", label: "HIS e HMP" },
  { chave: "his", label: "HIS" },
  { chave: "hmp", label: "HMP" },
];

// Mapeia o tipo de habitação do empreendimento para a variante de conteúdo.
export function chaveInfoPorTipo(tipo?: string | null): ChaveInfo | null {
  switch (tipo) {
    case "his_e_hmp": return "his_hmp";
    case "his":
    case "his_2": return "his";
    case "hmp": return "hmp";
    default: return null;
  }
}
