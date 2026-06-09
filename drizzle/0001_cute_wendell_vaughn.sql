CREATE TYPE "public"."status_lead" AS ENUM('novo', 'em_contato', 'qualificado', 'convertido', 'perdido');--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empreendimento_id" uuid,
	"nome" text NOT NULL,
	"email" text,
	"telefone" text,
	"mensagem" text,
	"origem" text,
	"status" "status_lead" DEFAULT 'novo' NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_empreendimento_id_empreendimentos_id_fk" FOREIGN KEY ("empreendimento_id") REFERENCES "public"."empreendimentos"("id") ON DELETE set null ON UPDATE no action;