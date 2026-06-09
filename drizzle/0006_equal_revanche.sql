CREATE TABLE "configuracoes" (
	"chave" text PRIMARY KEY NOT NULL,
	"valor" text,
	"atualizado_em" timestamp DEFAULT now() NOT NULL
);
