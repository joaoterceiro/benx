import type { Metadata } from "next";
import { PaginaCanal } from "@/components/public/pagina-canal";

export const metadata: Metadata = {
  title: "Assessoria de Imprensa",
  description:
    "Canal direto para jornalistas, assessores de imprensa e profissionais de comunicação que buscam informações institucionais sobre a Benx.",
};

export default function AssessoriaDeImprensaPage() {
  return (
    <PaginaCanal
      titulo="Assessoria de Imprensa"
      heroSrc="/canais/assessoria.jpg"
      heading={["Informações oficiais", "assessoria de imprensa"]}
      textoEsq="Este é o canal direto para jornalistas, assessores de imprensa e profissionais de comunicação que buscam informações institucionais sobre a Benx."
      textoDir="A Benx é referência em desenvolvimento imobiliário sustentável há mais de 46 anos. Nossa história é marcada pela inovação, qualidade construtiva e compromisso com o futuro das cidades."
      cardTexto="Fale agora com a nossa equipe responsável. Informações oficiais para jornalistas e veículos de comunicação."
      botoes={[
        { label: "Envie um e-mail", href: "mailto:graziele.val@communicacao.com.br" },
        { label: "Entre em contato", href: "https://wa.me/5511983360167", externo: true },
      ]}
    />
  );
}
