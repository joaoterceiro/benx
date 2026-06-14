import { unstable_cache } from "next/cache";
import { lerConfiguracoes } from "@/lib/config";
import { lerMenuPublico } from "@/lib/menu";
import { dadosBusca } from "@/db/queries";
import { lerBuscaConfig } from "@/lib/busca-config";
import { lerLegal } from "@/lib/legal";
import { sanitizarHtml } from "@/lib/sanitize";
import { BackToTop } from "@/components/public/whatsapp-float";
import { MenuOverlay } from "@/components/public/menu-overlay";
import { BuscaGlass } from "@/components/public/busca-glass";
import { CookieConsent } from "@/components/public/cookie-consent";
import { ContactLauncher } from "@/components/public/contact-launcher";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { logWarn } from "@/lib/log-context";

// Render dinâmico: o site lê config/menu/empreendimentos do banco. Com ISR/estático
// o build (sem banco) pré-renderizava o estado VAZIO e o cache servia isso ("estaca
// zero"). Dinâmico garante os dados reais a cada request; o Redis mantém rápido.
export const dynamic = "force-dynamic";

// Layout exclusivo do site público: menu, busca, WhatsApp e cookies/LGPD só
// aparecem aqui (não no admin).
export default async function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cfg = await unstable_cache(lerConfiguracoes, ["pub-config"], { revalidate: 60, tags: ["config"] })();
  const menu = await unstable_cache(lerMenuPublico, ["pub-menu"], { revalidate: 60, tags: ["menu"] })();
  const buscaConfig = await unstable_cache(lerBuscaConfig, ["pub-busca-cfg"], { revalidate: 60, tags: ["busca"] })();
  let buscaDados = null;
  try {
    buscaDados = await unstable_cache(
      () => dadosBusca(buscaConfig.qtdRecentes),
      ["pub-busca", String(buscaConfig.qtdRecentes)],
      { revalidate: 120, tags: ["busca", "empreendimentos"] }
    )();
  } catch (err) { await logWarn({ err, action: "carregar_dados_busca" }, "dados de busca indisponíveis no boot"); }
  const legal = await unstable_cache(lerLegal, ["pub-legal"], { revalidate: 300, tags: ["config", "legal"] })();

  // WhatsApp do launcher: número/mensagem reais da config (fallback p/ o número de marca).
  const waDigits = (cfg.whatsappNumero || "5511944431066").replace(/\D/g, "");
  const waMsg = cfg.whatsappMensagem?.replace(/\s*\{empreendimento\}/gi, "").trim() || "Olá, vi o Portal Benx e gostaria de mais informações.";
  const waHref = `https://wa.me/${waDigits}?text=${encodeURIComponent(waMsg)}`;

  return (
    <>
      {children}
      <ScrollReveal />
      <MenuOverlay itens={menu.itens} config={menu.config} />
      {buscaDados && <BuscaGlass dados={buscaDados} config={buscaConfig} />}
      <BackToTop />
      <ContactLauncher
        channels={[
          { id: "whatsapp", sup: "Vendas via", main: "WhatsApp", icon: "whatsapp", href: waHref },
          { id: "phone", sup: "Central de vendas", main: "0800 729 1981", icon: "phone", href: "tel:08007291981" },
          { id: "email", sup: "Vendas por", main: "E-mail", icon: "mail", href: "mailto:vendas@benx.com.br" },
        ]}
        phone2="4003-8503"
        phone2Label="Canal de Atendimento"
        phone2Hours="Seg - Sex · 9:00 às 17:00"
        statusText="Online · Equipe disponível agora"
      />
      <CookieConsent cookiesTexto={legal.cookiesTexto} politicaHtml={sanitizarHtml(legal.politica)} />
    </>
  );
}
