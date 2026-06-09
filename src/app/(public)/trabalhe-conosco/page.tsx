import type { Metadata } from "next";
import { PaginaCanal } from "@/components/public/pagina-canal";

export const metadata: Metadata = {
  title: "Trabalhe Conosco",
  description:
    "Faça parte do nosso time. Nossa equipe é formada por profissionais apaixonados pelo que fazem. Envie seu currículo e venha construir o futuro com a gente.",
};

export default function TrabalheConoscoPage() {
  return (
    <PaginaCanal
      titulo="Trabalhe conosco"
      heroSrc="/canais/trabalhe.jpg"
      heading={["Faça parte", "do nosso time"]}
      textoEsq="Nossa equipe é formada por profissionais apaixonados pelo que fazem e comprometidos em oferecer as melhores experiências aos nossos clientes."
      textoDir="Aqui, você encontra um ambiente colaborativo, oportunidades de desenvolvimento e reconhecimento pelo seu talento."
      cardTexto="Envie seu currículo e venha construir o futuro com a gente."
      botoes={[{ label: "Envie seu currículo agora", href: "mailto:recursoshumanos@benx.com.br?subject=Trabalhe%20Conosco" }]}
    />
  );
}
