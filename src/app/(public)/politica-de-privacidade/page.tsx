import type { Metadata } from "next";
import { lerLegal } from "@/lib/legal";
import { sanitizarHtml } from "@/lib/sanitize";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Saiba como a Benx coleta, utiliza e protege as informações dos usuários do site.",
};

export const dynamic = "force-dynamic";

export default async function PoliticaDePrivacidadePage() {
  const { politica } = await lerLegal();
  return (
    <div className="bg-white text-[#1a2230]">
      <header className="relative bg-[#0a2a66]">
        <SiteHeader />
        <div className="mx-auto h-20 w-full max-w-site" />
      </header>

      <section className="mx-auto w-full max-w-3xl px-6 py-16">
        <h1 className="text-[34px] font-light tracking-tight text-[#0a2a66] sm:text-[44px]">Política de Privacidade</h1>
        <div
          className="legal-conteudo mt-8"
          dangerouslySetInnerHTML={{ __html: sanitizarHtml(politica) }}
        />
      </section>

      <SiteFooter />
    </div>
  );
}
