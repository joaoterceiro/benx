CREATE TABLE "hero_slides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"local" text NOT NULL,
	"titulo" text NOT NULL,
	"imagem" text,
	"video_url" text,
	"link" text,
	"botao_texto" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"ordem" integer DEFAULT 0 NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL
);
