CREATE TABLE "menu_itens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"texto" text NOT NULL,
	"url" text NOT NULL,
	"ordem" integer DEFAULT 0 NOT NULL,
	"parent_id" uuid,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
