# Inventário de Snippets WPCode do Benx

15 snippets exportados. Mapeamento do que cada um faz e seu destino no clone.

## Lógica de negócio (replicar)

| Snippet | Tipo | Vira no clone |
|---------|------|---------------|
| Busca personalizado para empreendimentos | PHP 74k | feature/search completa (ver busca-spec.md) |
| Localização e Endereços v5 (legado) | PHP | componente BlocoLocalizacao |
| Localização e Endereços vivabenx | PHP | mesmo componente, fonte de dados unificada |
| Carrossel de Fachada | PHP | componente CarrosselFachada (galeria) |
| Carrossel de Áreas Comuns | PHP | componente CarrosselAreasComuns |
| Benx Journal Single Post | PHP | página de post do blog/journal |
| Benx Journal Listagem de Posts | PHP | listagem do blog/journal |
| Remove Medias quando Post removido | PHP | lógica de cascade no delete (já no schema via onDelete) |

## Chrome / UI global (recriar como componentes)

| Snippet | Tipo | Vira no clone |
|---------|------|---------------|
| Menu Overlay | PHP 236k | MenuOverlay (maior snippet, menu fullscreen) |
| Botão Flutuante de Contato (popup 1693) | PHP | FloatingContact |
| Efeito de zoom | CSS | micro-interação, vai pro Design System |

## Tokens / estilo (alimentam o Design System)

| Snippet | Tipo | Vira no clone |
|---------|------|---------------|
| Tamanhos de Fonte Elementor | PHP 17k | escala tipográfica -> tokens Tailwind |
| Snippet "1" (JS header) | JS | revisar; provável tracking ou init de libs |
| Snippet "2" (CSS header) | CSS | estilos globais, revisar e migrar |

## Descartar

| Snippet | Motivo |
|---------|--------|
| TESTE 01010 | 231 chars, snippet de teste sem uso real |

## Observações

- O Menu Overlay tem 236k chars: a maior parte é provavelmente HTML/CSS inline.
  Não portar literalmente; recriar o comportamento (menu fullscreen) limpo no Design System.
- Os dois snippets de Localização (legado + vivabenx) provam que o site roda as
  duas gerações em paralelo. No clone, uma fonte só.
- Os carrosséis usam as galerias (imagens_da_fachada, imagens_areas_comuns) que
  já estão modeladas como gallery no schema e migram pro MinIO.
