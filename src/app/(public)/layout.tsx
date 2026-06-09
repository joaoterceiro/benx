import { unstable_cache } from "next/cache";
import { lerConfiguracoes } from "@/lib/config";
import { lerMenuPublico } from "@/lib/menu";
import { dadosBusca } from "@/db/queries";
import { lerBuscaConfig } from "@/lib/busca-config";
import { lerLegal } from "@/lib/legal";
import { sanitizarHtml } from "@/lib/sanitize";
import { WhatsAppFloat, BackToTop } from "@/components/public/whatsapp-float";
import { MenuOverlay } from "@/components/public/menu-overlay";
import { BuscaGlass } from "@/components/public/busca-glass";
import { CookieConsent } from "@/components/public/cookie-consent";
import { CanaisVendas } from "@/components/public/canais-vendas";
import { logWarn } from "@/lib/log-context";

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

  return (
    <>
      {children}
      <MenuOverlay itens={menu.itens} config={menu.config} />
      {buscaDados && <BuscaGlass dados={buscaDados} config={buscaConfig} />}
      <BackToTop />
      <CanaisVendas />
      <WhatsAppFloat numero={cfg.whatsappNumero} texto={cfg.whatsappTexto} mensagem={cfg.whatsappMensagem} ativo={cfg.whatsappAtivo} />
      <CookieConsent cookiesTexto={legal.cookiesTexto} politicaHtml={sanitizarHtml(legal.politica)} />
    </>
  );
}
