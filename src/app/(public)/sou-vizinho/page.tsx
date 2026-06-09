import type { Metadata } from "next";
import { PaginaCanal } from "@/components/public/pagina-canal";

export const metadata: Metadata = {
  title: "Sou Vizinho",
  description:
    "Construindo com respeito à comunidade. Caso você tenha algum comentário ou reclamação sobre nossas obras, entre em contato conosco.",
};

export default function SouVizinhoPage() {
  return (
    <PaginaCanal
      titulo="Sou Vizinho"
      heroSrc="/canais/sou-vizinho.jpg"
      heading={["Construindo com", "respeito à comunidade"]}
      textoEsq="Nós seguimos a legislação vigente e procuramos conhecer a rotina e hábitos dos bairros para minimizar qualquer transtorno aos vizinhos de nossas obras."
      textoDir="Mesmo assim, nós sabemos que obras, às vezes, resultam em pequenas alterações no dia a dia da vizinhança. Caso você tenha algum comentário ou reclamação a fazer, entre em contato conosco pelo e-mail relacionamento@benx.com.br ou pelo telefone (11) 4003-8503."
      cardTexto="Caso você tenha algum comentário ou reclamação a fazer, entre em contato conosco."
      botoes={[
        { label: "Envie um e-mail", href: "mailto:relacionamento@benx.com.br" },
        { label: "Entre em contato", href: "https://wa.me/5511983360167", externo: true },
      ]}
    />
  );
}
