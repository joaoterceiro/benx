-- Correção de drift: alinhamentos que foram aplicados em dev via SQL cru e
-- nunca viraram migration. Tudo idempotente (seguro reaplicar).

-- hero_slides: schema usa "locais" (jsonb) + "duracao"; a migration 0009 criou "local" (text).
ALTER TABLE "hero_slides" ADD COLUMN IF NOT EXISTS "locais" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "hero_slides" ADD COLUMN IF NOT EXISTS "duracao" integer DEFAULT 6 NOT NULL;--> statement-breakpoint
ALTER TABLE "hero_slides" DROP COLUMN IF EXISTS "local";--> statement-breakpoint

-- empreendimentos: campos de SEO.
ALTER TABLE "empreendimentos" ADD COLUMN IF NOT EXISTS "seo_titulo" text;--> statement-breakpoint
ALTER TABLE "empreendimentos" ADD COLUMN IF NOT EXISTS "seo_descricao" text;--> statement-breakpoint

-- leads: consentimento LGPD no ponto de coleta.
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "consentimento" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "consentimento_em" timestamp;--> statement-breakpoint

-- consentimentos: registro de consentimento de cookies (prova LGPD).
CREATE TABLE IF NOT EXISTS "consentimentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"versao" text NOT NULL,
	"necessarios" boolean DEFAULT true NOT NULL,
	"analiticos" boolean DEFAULT false NOT NULL,
	"marketing" boolean DEFAULT false NOT NULL,
	"acao" text NOT NULL,
	"user_agent" text,
	"ip" text,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
