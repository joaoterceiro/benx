-- Config da splash (home rica com 4 ecossistemas). Idempotente: so insere se
-- a chave ainda nao existir (nao sobrescreve ajustes feitos no admin).
INSERT INTO "configuracoes" ("chave","valor") VALUES
  ('splash_home','true'),
  ('splash_video','/bg-hero.mp4'),
  ('splash_logo_benx','/splash-benx.png'),
  ('splash_logo_viva','/logo-vivabenx.svg'),
  ('splash_logo_extra','/parque-global-logo.svg'),
  ('splash_botoes','[{"label":"Icônicos","logoKey":"benx","href":"/iconicos","showLabel":true,"subtitle":"Residenciais elevados\nao estado de arte","logoSize":40},{"label":"Benx","logoKey":"benx","href":"/benx","showLabel":false,"subtitle":"Projetos de excelência em localizações privilegiadas","logoSize":40},{"label":"Viva Benx","logoKey":"viva","href":"/vivabenx","showLabel":false,"subtitle":"A união entre mobilidade urbana e arquitetura inteligente","logoSize":80},{"label":"Parque Global","logoKey":"extra","href":"https://parqueglobal.com.br/","showLabel":false,"subtitle":"Novo jeito de viver em São Paulo.","logoSize":60}]')
ON CONFLICT ("chave") DO NOTHING;
