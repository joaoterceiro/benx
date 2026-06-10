-- posts_jornal: campos de SEO (adicionados em dev via SQL cru, faltavam na migration).
ALTER TABLE "posts_jornal" ADD COLUMN IF NOT EXISTS "seo_titulo" text;--> statement-breakpoint
ALTER TABLE "posts_jornal" ADD COLUMN IF NOT EXISTS "seo_descricao" text;
