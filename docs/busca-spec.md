# Property Search do Benx — Especificação para o Clone

Engenharia reversa do snippet WPCode "Busca personalizado para empreendimentos"
(classe PHP, ~74k chars). Esta é a lógica que o Agente Busca replica em
`src/features/search/`. Sem reproduzir o PHP: só o comportamento.

## Comportamento

Busca via AJAX com debounce, retorna até 12 resultados por vez, ordenados por
data (mais recentes primeiro). Tem duas variantes de UI (shortcodes
`empreendimentos_search` e `empreendimentos_search_glass`, este último a versão
glass/overlay). No clone, uma rota de listagem com os filtros.

## Filtros (todos opcionais, combináveis com AND)

| Filtro    | Origem            | Como aplica                          |
|-----------|-------------------|--------------------------------------|
| s (texto) | título do post    | busca textual no nome                |
| tipo      | taxonomia         | residencial / comercial (só estes 2) |
| cidade    | taxonomia         | slug do termo                        |
| bairro    | taxonomia         | slug do termo, dependente da cidade  |
| categoria | taxonomia         | slug do termo                        |
| status    | meta field        | status da obra, comparação exata     |

Regras:
- Filtros de taxonomia entram como tax_query com relation AND quando há mais de um.
- O filtro `tipo` é restrito a "residencial" e "comercial" (mesmo que a taxonomia
  tenha mais termos, a UI só oferece esses dois).
- `status` filtra por meta (no clone, é a coluna `status_obra` do empreendimento).
- Bairros são carregados dinamicamente após escolher a cidade (endpoint próprio
  `ajax_get_bairros` no WP). No clone: ao mudar cidade, recarrega lista de bairros.

## Mapeamento das duas gerações (importante)

A busca suporta dois post types via `get_context_for_post_type`. No clone
isso some, porque unificamos numa entidade só. Mas a tabela abaixo documenta
de onde cada dado real vem na migração:

| Contexto      | vivabenx (novo)               | empreendimentos (legado)   |
|---------------|-------------------------------|----------------------------|
| post_type     | vivabenx                      | empreendimentos            |
| tax tipo      | tipo-empreendimento_vivabenx  | tipo-empreendimento        |
| tax categoria | categoria_vivabenx            | categoria_empreendimento   |
| tax cidade    | cidadeestado_vivabenx         | cidadeestado               |
| tax bairro    | bairro__vivabenx              | bairro_                    |
| meta status   | status_da_obra_vb             | status_da_obra_            |

## Recursos auxiliares da UI da busca

- Cidades populares: top 5 cidades por contagem de empreendimentos (ordenado desc).
  No clone: `SELECT cidade, COUNT(*) ... GROUP BY cidade ORDER BY count DESC LIMIT 5`.
- Recentes: últimos 4 empreendimentos publicados, mostrados como sugestão inicial.
- Cada resultado retorna: id, título, url, imagem (thumb medium), cidade, bairro,
  tipo, status. No clone, a query traz o empreendimento + joins de taxonomia.

## Tradução para o clone (Next + Drizzle + Redis)

1. Server Action `searchEmpreendimentos(filtros, page)` em `src/features/search/`.
2. Query Drizzle: where por `cidadeId`, `bairroId`, `categoriaId`, `statusObra` e
   `ilike` no nome quando há texto. Paginação de 12, order by `criadoEm desc`.
3. Bairros dependentes: action `getBairrosPorCidade(cidadeId)`.
4. Cache Redis por combinação de filtros (chave = hash dos filtros + page),
   TTL curto. Invalidar no write de empreendimento.
5. URL sincronizada com searchParams (?cidade=&bairro=&tipo=&status=&q=) para
   links compartilháveis, espelhando o comportamento do site atual.
6. Restringir `tipo` a residencial/comercial na UI.

## Outros snippets relevantes (seções da página de produto)

Estes confirmam os meta keys do schema e viram componentes no Design System:

- benx_localizacao / vbx_localizacao: bloco de localização (endereço, bairro,
  cidade, stand de vendas, links Uber/Maps/Waze, detalhes em repeater).
- benx_carrossel_fachada: carrossel da galeria de fachada.
- benx_carrossel_areas_comuns: carrossel das áreas comuns.
- Botão flutuante de contato (popup) e menu overlay: chrome do site, viram
  componentes globais (FloatingContact, MenuOverlay).
- Tamanhos de fonte Elementor: tokens de tipografia, alimenta o Design System.

## REGRA DE ECOSSISTEMA (linha de produto isola tudo)

Atualização do cliente: cada vertente Benx é um ecossistema independente.
Ao entrar em uma vertente (ex.: VivaBenx), o portal mostra SOMENTE empreendimentos
daquela linha. Não há mistura entre Benx Únicos, Benx e VivaBenx.

Isto valida a separação que o JetEngine já fazia (taxonomias por geração:
cidadeestado_vivabenx vs cidadeestado, etc.).

Implicações no clone:

1. PORTAL DE ENTRADA: a home / seletor de marca lista as vertentes. Escolher uma
   define o escopo de toda a navegação seguinte (rota tipo /vivabenx, /benx, /unicos).

2. BUSCA ESCOPADA: toda query de empreendimentos recebe um filtro fixo
   `where linhaProduto = <vertente ativa>`. O usuário nunca vê outra linha dentro
   de um ecossistema. Os filtros (cidade, bairro, tipo, status) operam dentro desse escopo.

3. TAXONOMIAS POR ECOSSISTEMA: cidades e bairros sugeridos/filtráveis são os que
   têm empreendimentos naquela linha. VivaBenx (econômico, HIS/HMP) atua em regiões
   diferentes de Benx Únicos (alto padrão), então as listas divergem por ecossistema.

4. IDENTIDADE VISUAL: cada ecossistema pode ter accent/selo próprio
   (Únicos dourado, Benx azul, VivaBenx verde), aplicado no escopo daquela vertente.

5. CADASTRO: o empreendimento nasce dentro de um ecossistema (campo linhaProduto
   obrigatório). A rota pública e a listagem derivam dele. O cadastro exibe o
   ecossistema ativo no header como reforço.

Resumo para o Agente Busca: a vertente é um filtro de PRIMEIRO nível, aplicado
antes de qualquer outro, e não é opcional dentro de um ecossistema.
