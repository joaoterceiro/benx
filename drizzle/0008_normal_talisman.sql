CREATE TABLE "posts_jornal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"titulo" text NOT NULL,
	"categoria" text DEFAULT 'Sem categoria' NOT NULL,
	"fonte" text,
	"fonte_url" text,
	"resumo" text,
	"conteudo" text,
	"imagem" text,
	"data_publicacao" timestamp DEFAULT now() NOT NULL,
	"destaque" boolean DEFAULT false NOT NULL,
	"publicado" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "posts_jornal_slug_unique" UNIQUE("slug")
);
