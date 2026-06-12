-- Nova logo Benx (svg) no footer. Troca o valor salvo antigo pelo novo,
-- sem mexer numa logo customizada diferente. Se a chave não existir, o default
-- do código (/logo-benx.svg) já aplica.
UPDATE "configuracoes"
SET "valor" = '/logo-benx.svg', "atualizado_em" = now()
WHERE "chave" = 'footer_logo'
  AND ("valor" = '/logo-benx-branco.png' OR "valor" IS NULL OR "valor" = '');
