import type { Metadata } from "next";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { Reveal } from "@/components/public/reveal";
import { CanaisAccordion, type Canal } from "@/components/public/atendimento/canais-accordion";

export const metadata: Metadata = {
  title: "Atendimento",
  description:
    "Todos os canais de atendimento da Benx em um só lugar: vendas, portal do cliente, ética, trabalhe conosco, imprensa, terrenos, vizinhança e parcerias.",
};

const NAVY = "#0a2a66";
const COL = "mx-auto w-full max-w-site px-6";

const CANAIS: Canal[] = [
  {
    label: "Vendas",
    href: "/vendas",
    resumo: "Fale com a Central de Vendas para conhecer empreendimentos, agendar visitas, simular financiamento e ser atendido por um consultor.",
    contatos: [
      { tipo: "tel", texto: "0800 729 1981", href: "tel:08007291981" },
      { tipo: "whats", texto: "(11) 94443-1066", href: "https://wa.me/5511944431066" },
      { tipo: "mail", texto: "relacionamento@benx.com.br", href: "mailto:relacionamento@benx.com.br" },
    ],
  },
  {
    label: "Portal do Cliente",
    href: "/portal-do-cliente",
    resumo: "Área exclusiva do cliente: informações financeiras, 2ª via de boletos, evolução da obra e mensagens para a Central de Atendimento.",
    obs: "Atendimento de segunda a sexta, das 9h às 18h.",
    ctas: [{ label: "Acessar o Portal", href: "https://portalcliente.benx.com.br/acesso" }],
    contatos: [
      { tipo: "tel", texto: "4003-8503", href: "tel:40038503" },
      { tipo: "mail", texto: "relacionamento@benx.com.br", href: "mailto:relacionamento@benx.com.br" },
    ],
  },
  {
    label: "Canal de Ética",
    href: "/canal-de-etica",
    resumo: "Canal confidencial e anônimo para reportar condutas inadequadas ou violações de ética e compliance da Benx e da BEM Imobiliária.",
    ctas: [{ label: "Fazer uma denúncia", href: "https://denuncia.iauditcloud.com.br/benx" }],
  },
  {
    label: "Trabalhe Conosco",
    href: "/trabalhe-conosco",
    resumo: "Faça parte do time Benx. Envie seu currículo e participe dos nossos processos seletivos.",
    ctas: [{ label: "Enviar currículo", href: "mailto:recursoshumanos@benx.com.br?subject=Trabalhe%20Conosco" }],
  },
  {
    label: "Assessoria de Imprensa",
    href: "/assessoria-de-imprensa",
    resumo: "Canal para jornalistas e profissionais de comunicação solicitarem informações institucionais e materiais oficiais.",
    contatos: [
      { tipo: "whats", texto: "(11) 98336-0167", href: "https://wa.me/5511983360167" },
      { tipo: "mail", texto: "graziele.val@communicacao.com.br", href: "mailto:graziele.val@communicacao.com.br" },
    ],
  },
  {
    label: "Venda seu Terreno",
    href: "/venda-seu-terreno",
    resumo: "Tem um terreno com potencial construtivo? A Benx avalia e negocia com transparência. Envie a sua proposta.",
    ctas: [{ label: "Oferecer meu terreno", href: "mailto:terrenos@benx.com.br?subject=quero%20vender%20meu%20terreno" }],
  },
  {
    label: "Sou Vizinho",
    href: "/sou-vizinho",
    resumo: "Vizinho de uma obra Benx? Envie comentários ou reclamações. Trabalhamos para minimizar transtornos e respeitar a comunidade.",
    contatos: [
      { tipo: "tel", texto: "(11) 4003-8503", href: "tel:40038503" },
      { tipo: "whats", texto: "(11) 98336-0167", href: "https://wa.me/5511983360167" },
      { tipo: "mail", texto: "relacionamento@benx.com.br", href: "mailto:relacionamento@benx.com.br" },
    ],
  },
  {
    label: "Corretores e Imobiliárias",
    href: "/corretores-e-imobiliarias",
    resumo: "Programa de parcerias: acesse materiais de venda (tabela de preços, espelho e memoriais) e potencialize seus resultados.",
    ctas: [
      { label: "Acessar parcerias", href: "https://parcerias.benx.com.br/Login" },
      { label: "Cadastrar", href: "https://parcerias.benx.com.br/cadastro" },
    ],
    contatos: [{ tipo: "mail", texto: "rh.bem@bemimobiliaria.com.br", href: "mailto:rh.bem@bemimobiliaria.com.br" }],
  },
];

export default function AtendimentoPage() {
  return (
    <div className="bg-white text-[#1a2230]">
      {/* HERO */}
      <header className="relative flex h-[60vh] min-h-[420px] flex-col justify-end overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/atendimento/hero.jpg" alt="Atendimento" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/40" />

        <SiteHeader />

        <div className={`relative z-10 ${COL} pb-12`}>
          <h1 className="text-[40px] font-light leading-none tracking-tight text-white sm:text-[64px]">Atendimento</h1>
        </div>
      </header>

      {/* CANAIS */}
      <section className={`${COL} py-20`}>
        <Reveal>
          <h2 className="max-w-3xl text-[28px] font-light leading-[1.25] tracking-tight sm:text-[36px]" style={{ color: NAVY }}>
            Todos os <span className="font-semibold">canais de atendimento</span> da Benx em um só lugar. Toque no canal que precisa e fale com a gente
          </h2>

          <CanaisAccordion canais={CANAIS} />
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
