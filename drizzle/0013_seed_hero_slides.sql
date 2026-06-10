-- Slides do hero (homes das vertentes + /empreendimentos), espelhando o dev.
-- Imagens servidas de /public/slides (sem dependencia do MinIO).
-- Idempotente: so insere se a tabela ainda estiver vazia (nao duplica nem
-- sobrescreve slides gerenciados pelo admin).
INSERT INTO "hero_slides" ("locais","titulo","imagem","video_url","link","botao_texto","tags","ordem","duracao","ativo")
SELECT v.locais::jsonb, v.titulo, v.imagem, v.video_url, v.link, v.botao_texto, v.tags::jsonb, v.ordem, v.duracao, v.ativo
FROM (VALUES
  ('["benx"]','Brooklin Noventa Living','/slides/2026/03/14-Benx-Joao-Lacerda-Refacao-Projeto-Sala-Decorado-2-dorm-R02-comp.webp',NULL,NULL,'Conheça','[]',1,6,true),
  ('["benx_iconicos"]','Autór Jardins','/slides/2025/10/fachada_autor_benx.jpg',NULL,'https://www.autorjardins.com.br/','Conheça','[]',1,6,true),
  ('["vivabenx"]','Leopoldina III','/slides/2025/11/08-PERSPECTIVA-ILUSTRADA-DO-VOO-DA-PISCINA.webp',NULL,'/vivabenx/viva-benx-vila-leopoldina-iii','Conheça','[]',1,6,true),
  ('["benx"]','Raro Perdizes','/slides/2025/10/20250221_Raro_Perdizes_Fachada-2-scaled.webp',NULL,'/benx/raro-perdizes','Conheça','[]',2,6,true),
  ('["benx_iconicos"]','280 Art Boulevard','/slides/2026/03/280-Art-Boulevard.webp',NULL,'https://artboulevard.com.br/','Conheça','[]',2,6,true),
  ('["vivabenx"]','Estação Vila Mariana','/slides/2025/11/22-CHURRASQUEIRA-NA-COBERTURA_FINAL.webp',NULL,'/vivabenx/viva-benx-estacao-vila-mariana','Conheça','[]',2,6,true),
  ('["benx"]','Lisbô Pinheiros','/slides/2026/03/03-PERSPECTIVA-ILUSTRADA-DO-EMBASAMENTO-FINAL.webp',NULL,'/benx/lisbo-pinheiros','Conheça','[]',3,6,true),
  ('["benx_iconicos"]','1800 Oscar Pinheiros','/slides/2025/10/Principal-1800-OSCAR-PINHEIROS-1920X1280.png',NULL,'/benx/1800-oscar-pinheiros','Conheça','[]',3,6,true),
  ('["vivabenx"]','Klabin','/slides/2025/11/01-Benx-Ricardo-Jafet-Portaria-R03.webp',NULL,'/vivabenx/viva-benx-klabin','Conheça','[]',3,6,true)
) AS v(locais,titulo,imagem,video_url,link,botao_texto,tags,ordem,duracao,ativo)
WHERE NOT EXISTS (SELECT 1 FROM "hero_slides");
