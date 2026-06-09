import type { Metadata } from "next";
import { PaginaCanal } from "@/components/public/pagina-canal";

export const metadata: Metadata = {
  title: "Venda seu Terreno",
  description:
    "A Benx está sempre em busca de novos terrenos para desenvolver empreendimentos inovadores e sustentáveis. Se você possui um terreno com potencial construtivo, queremos conhecê-lo.",
};

export default function VendaSeuTerrenoPage() {
  return (
    <PaginaCanal
      titulo="Venda seu Terreno"
      heroSrc="/canais/terreno.jpg"
      heading={["Seu terreno pode ser", "um grande negócio"]}
      textoEsq="A Benx está sempre em busca de novos terrenos para desenvolver empreendimentos inovadores e sustentáveis. Se você possui um terreno com potencial construtivo, queremos conhecê-lo."
      textoDir="Com 46 anos de experiência no mercado imobiliário, oferecemos negociações transparentes, avaliações técnicas criteriosas e as melhores condições comerciais."
      cardTexto="Fale agora com a nossa equipe responsável."
      botoes={[{ label: "Envie um e-mail", href: "mailto:terrenos@benx.com.br?subject=quero%20vender%20meu%20terreno" }]}
    />
  );
}
