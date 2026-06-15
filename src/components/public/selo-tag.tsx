import { seloPosClasses, type SeloConfig } from "@/lib/selo";

// Overlay do selo de habitação na card. O pai deve ser position:relative.
export function SeloTag({ url, config }: { url: string; config: SeloConfig }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt="Selo Prefeitura de São Paulo — habitação"
      className={`pointer-events-none absolute z-20 h-auto ${seloPosClasses(config.posicao)}`}
      style={{ width: `${config.tamanho}%`, margin: `${config.margem}px`, opacity: config.opacidade / 100 }}
    />
  );
}
