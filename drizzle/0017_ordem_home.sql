-- Ordenação manual da faixa de empreendimentos na home (por vertente) + modo aleatório.
ALTER TABLE "empreendimentos" ADD COLUMN IF NOT EXISTS "ordem_home" integer NOT NULL DEFAULT 0;
--> statement-breakpoint
-- Modo por home: 'manual' (usa ordem_home) ou 'aleatorio' (random a cada load).
INSERT INTO "configuracoes" ("chave","valor") VALUES
  ('home_ordem_modo_benx','manual'),
  ('home_ordem_modo_vivabenx','manual'),
  ('home_ordem_modo_benx_iconicos','manual')
ON CONFLICT ("chave") DO NOTHING;
