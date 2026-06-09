ALTER TABLE "empreendimentos" ALTER COLUMN "status_obra" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "empreendimentos" ALTER COLUMN "status_obra" SET DATA TYPE text USING "status_obra"::text;--> statement-breakpoint
ALTER TABLE "empreendimentos" ALTER COLUMN "status_obra" SET DEFAULT 'lancamento';--> statement-breakpoint
ALTER TABLE "empreendimentos" ALTER COLUMN "tipo_habitacao" SET DATA TYPE text USING "tipo_habitacao"::text;--> statement-breakpoint
DROP TYPE "public"."status_obra";--> statement-breakpoint
DROP TYPE "public"."tipo_habitacao";
