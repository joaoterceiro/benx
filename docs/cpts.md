# Inventário de Dados do Benx (JetEngine)

Extraído do export oficial do JetEngine (skin-export). Esta é a fonte real do modelo
de dados, mais confiável que crawl da REST API.

## Visão geral

O Benx é, por dentro, um catálogo de **empreendimentos imobiliários**. A entidade
central é o empreendimento; as unidades (tipologias) são as **plantas**, ligadas por
relação many-to-many.

Existem DUAS gerações de CPTs no WP atual:
- Legado: `empreendimentos` (78 campos) + `plantas`
- Nova (sufixo _vb): `vivabenx` (75 campos) + `plantas_vivabenx`

São quase idênticas. NO CLONE, unificar em uma entidade só (Empreendimento + Planta).
Não replicar a duplicação. Migrar preferindo a geração `vivabenx` (mais nova) e
completar com a legada onde houver dados só nela.

## Entidades

### Empreendimento
Agrupado nos blocos abaixo (que também são as SEÇÕES da página de produto):

1. Informações do imóvel: nome, tipo de habitação (HIS/HMP/HIS E HMP), subtítulo,
   o projeto, arquitetura, paisagismo, interiores, status da obra, previsão de entrega.
2. Características: total de unidades, andares, unidades por andar, número de torres,
   área do terreno, área construída total, metragem (residencial/NR), quartos, vagas.
3. Diferenciais e áreas comuns: repeater de diferenciais, repeater de áreas comuns.
4. Galeria de mídias: imagem principal, imagens áreas comuns (gallery), imagens da
   fachada (gallery), thumbnail de vídeo, URL vídeo principal, URL tour virtual, vistas do andar.
5. Localização: endereço parcial/completo, bairro, cidade, estado, CEP, endereço de
   vendas, stand de vendas, links Uber/Maps/Waze, repeater detalhes da localização.
6. Certificações: repeater de certificações.
7. Status da obra: documentação, fundação, alvenaria, acabamento, total (percentuais),
   data de atualização, galeria de imagens da obra.
8. Configurações de visibilidade (switchers): visibilidade no site, exibir obras,
   exibir plantas, exibir localização, modo breve lançamento.
9. Extras (legado): redirecionar página, tags para card do produto (repeater).

Campos relacionais: vincular outros empreendimentos (relacionados).

### Planta (unidade / tipologia)
Filha de Empreendimento (N:N). Campos: lista de recursos (repeater), além de
metragem, dormitórios, etc. (detalhar no segundo passo de extração das plantas).

## Relações
- vivabenx  N:N  plantas_vivabenx   (relation id 23, db_table)
- empreendimentos  N:N  plantas       (relation id 10, db_table)
No clone: uma tabela de junção empreendimento_planta.

## Taxonomias (origem dos FILTROS da property search)
- cidadeestado / cidadeestado_vivabenx
- bairro_ / bairro__vivabenx
- categoria_empreendimento / categoria_vivabenx
- disponibilidade / disponibilidade_vivabenx
- tipo-empreendimento_vivabenx
- linha_produto

No clone, viram tabelas de lookup (ou enums onde o conjunto é fechado).
A busca filtra por estas dimensões, NÃO por colunas livres.

## Vocabulários (valores reais)

Status da obra (normalizar, há duplicatas no WP):
  Lançamento | Em construção | Pronto para morar | Entregue
  (limpar variações: "na planta", "Pronto para Morar", etc.)

Tipo de habitação: HIS | HMP | HIS E HMP

Linha do produto (vertentes Benx, por segmento de padrão):
  Benx Únicos (alto padrão) | Benx (médio padrão) | VivaBenx (econômico, HIS/HMP)
  OBS: cliente mencionou 4 vertentes; a 4ª está pendente de confirmação.
  VivaBenx casa com tipo_de_habitacao HIS/HMP (segmento econômico).
  No clone: linhaProduto é OBRIGATÓRIO no cadastro e é uma das dimensões de filtro da busca.

## Status da obra é multi-etapa
Não é uma barra única. São percentuais por etapa: fundação, alvenaria, acabamento,
total, com data de atualização. O componente ProgressoObra deve refletir as etapas.

## Limpeza necessária na migração
Descartar campos lixo do editor: header_section_*_copy_copy_copysdfsdfsd,
*adssdasd, *dfgdfg e similares. São duplicações acidentais, sem dado real.

## Switchers de visibilidade
Respeitar no clone. Cada empreendimento controla quais seções renderizam
(obras, plantas, localização, modo breve lançamento). Sem isso, o clone
mostra seções vazias.
