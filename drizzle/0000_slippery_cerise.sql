CREATE TYPE "public"."status_obra" AS ENUM('lancamento', 'em_construcao', 'pronto_para_morar', 'entregue');--> statement-breakpoint
CREATE TYPE "public"."tipo_habitacao" AS ENUM('his', 'hmp', 'his_e_hmp');--> statement-breakpoint
CREATE TYPE "public"."tipo_midia" AS ENUM('imagem', 'video', 'planta', 'fachada', 'area_comum', 'obra');--> statement-breakpoint
CREATE TABLE "bairros" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"slug" text NOT NULL,
	"cidade_id" uuid,
	CONSTRAINT "bairros_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "categorias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "categorias_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "cidades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"estado" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "cidades_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "empreendimento_planta" (
	"empreendimento_id" uuid NOT NULL,
	"planta_id" uuid NOT NULL,
	CONSTRAINT "empreendimento_planta_empreendimento_id_planta_id_pk" PRIMARY KEY("empreendimento_id","planta_id")
);
--> statement-breakpoint
CREATE TABLE "empreendimentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"nome" text NOT NULL,
	"subtitulo" text,
	"tipo_habitacao" "tipo_habitacao",
	"status_obra" "status_obra" DEFAULT 'lancamento' NOT NULL,
	"previsao_entrega" date,
	"o_projeto" text,
	"arquitetura" text,
	"paisagismo" text,
	"interiores" text,
	"total_unidades" integer,
	"total_andares" integer,
	"unidades_por_andar" integer,
	"numero_torres" integer,
	"area_terreno" numeric,
	"area_construida_total" numeric,
	"metragem_residencial" text,
	"metragem_nr" text,
	"quartos" text,
	"vagas" text,
	"texto_legal" text,
	"endereco_parcial" text,
	"endereco_completo" text,
	"cep" text,
	"endereco_vendas" text,
	"stand_de_vendas" text,
	"link_uber" text,
	"link_maps" text,
	"link_waze" text,
	"imagem_principal" text,
	"logotipo" text,
	"url_video_principal" text,
	"thumbnail_video" text,
	"url_tour_virtual" text,
	"vistas_do_andar" text,
	"obra_fundacao" integer,
	"obra_alvenaria" integer,
	"obra_acabamento" integer,
	"obra_total" integer,
	"obra_atualizada_em" date,
	"visivel" boolean DEFAULT true NOT NULL,
	"exibir_obras" boolean DEFAULT false NOT NULL,
	"exibir_plantas" boolean DEFAULT true NOT NULL,
	"exibir_localizacao" boolean DEFAULT true NOT NULL,
	"modo_breve_lancamento" boolean DEFAULT false NOT NULL,
	"diferenciais" jsonb DEFAULT '[]'::jsonb,
	"areas_comuns" jsonb DEFAULT '[]'::jsonb,
	"certificacoes" jsonb DEFAULT '[]'::jsonb,
	"detalhes_localizacao" jsonb DEFAULT '[]'::jsonb,
	"tags_card" jsonb DEFAULT '[]'::jsonb,
	"cidade_id" uuid,
	"bairro_id" uuid,
	"categoria_id" uuid,
	"linha_produto_id" uuid,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "empreendimentos_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "linhas_produto" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "linhas_produto_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "midias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empreendimento_id" uuid,
	"chave" text NOT NULL,
	"alt" text,
	"tipo" "tipo_midia" DEFAULT 'imagem' NOT NULL,
	"ordem" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plantas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"nome" text NOT NULL,
	"metragem" numeric,
	"dormitorios" integer,
	"suites" integer,
	"vagas" integer,
	"imagem_planta" text,
	"recursos" jsonb DEFAULT '[]'::jsonb,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "plantas_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "bairros" ADD CONSTRAINT "bairros_cidade_id_cidades_id_fk" FOREIGN KEY ("cidade_id") REFERENCES "public"."cidades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "empreendimento_planta" ADD CONSTRAINT "empreendimento_planta_empreendimento_id_empreendimentos_id_fk" FOREIGN KEY ("empreendimento_id") REFERENCES "public"."empreendimentos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "empreendimento_planta" ADD CONSTRAINT "empreendimento_planta_planta_id_plantas_id_fk" FOREIGN KEY ("planta_id") REFERENCES "public"."plantas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "empreendimentos" ADD CONSTRAINT "empreendimentos_cidade_id_cidades_id_fk" FOREIGN KEY ("cidade_id") REFERENCES "public"."cidades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "empreendimentos" ADD CONSTRAINT "empreendimentos_bairro_id_bairros_id_fk" FOREIGN KEY ("bairro_id") REFERENCES "public"."bairros"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "empreendimentos" ADD CONSTRAINT "empreendimentos_categoria_id_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "empreendimentos" ADD CONSTRAINT "empreendimentos_linha_produto_id_linhas_produto_id_fk" FOREIGN KEY ("linha_produto_id") REFERENCES "public"."linhas_produto"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "midias" ADD CONSTRAINT "midias_empreendimento_id_empreendimentos_id_fk" FOREIGN KEY ("empreendimento_id") REFERENCES "public"."empreendimentos"("id") ON DELETE cascade ON UPDATE no action;