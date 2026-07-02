CREATE TYPE "public"."contrato_status" AS ENUM('pendente', 'assinado');--> statement-breakpoint
CREATE TYPE "public"."orcamento_status" AS ENUM('rascunho', 'enviado', 'aprovado', 'pago_parcial', 'pago_total', 'recusado');--> statement-breakpoint
CREATE TYPE "public"."post_status" AS ENUM('rascunho', 'publicado');--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"iniciais" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contratos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"freela_id" uuid NOT NULL,
	"titulo" text NOT NULL,
	"tipo" text NOT NULL,
	"status" "contrato_status" DEFAULT 'pendente' NOT NULL,
	"data" date NOT NULL,
	"arquivo_path" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "freelas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"tipo" text DEFAULT '' NOT NULL,
	"cor" text DEFAULT '#818cf8' NOT NULL,
	"cliente_nome" text NOT NULL,
	"cliente_email" text DEFAULT '' NOT NULL,
	"cliente_whatsapp" text DEFAULT '' NOT NULL,
	"chave_crono" text NOT NULL,
	"resumo" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "freelas_chave_crono_unique" UNIQUE("chave_crono")
);
--> statement-breakpoint
CREATE TABLE "observacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"freela_id" uuid NOT NULL,
	"data" date NOT NULL,
	"texto" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reunioes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"freela_id" uuid NOT NULL,
	"titulo" text NOT NULL,
	"data" date NOT NULL,
	"topicos" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orcamento_itens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"orcamento_id" uuid NOT NULL,
	"desc" text NOT NULL,
	"tempo" text DEFAULT '' NOT NULL,
	"valor" numeric(12, 2) DEFAULT '0' NOT NULL,
	"prazo" date,
	"done" boolean DEFAULT false NOT NULL,
	"ordem" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orcamentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"freela_id" uuid NOT NULL,
	"numero" integer GENERATED ALWAYS AS IDENTITY (sequence name "orcamentos_numero_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"titulo" text NOT NULL,
	"status" "orcamento_status" DEFAULT 'rascunho' NOT NULL,
	"chave" text NOT NULL,
	"valor" numeric(12, 2) NOT NULL,
	"pago" numeric(12, 2) DEFAULT '0' NOT NULL,
	"data" date NOT NULL,
	"prazo_exec" text DEFAULT '' NOT NULL,
	"aprovado_em" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orcamentos_chave_unique" UNIQUE("chave")
);
--> statement-breakpoint
CREATE TABLE "meta_recursos" (
	"meta_id" uuid NOT NULL,
	"orcamento_id" uuid NOT NULL,
	CONSTRAINT "meta_recursos_meta_id_orcamento_id_pk" PRIMARY KEY("meta_id","orcamento_id")
);
--> statement-breakpoint
CREATE TABLE "metas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"titulo" text NOT NULL,
	"valor" numeric(12, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projetos_pessoais" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"desc" text DEFAULT '' NOT NULL,
	"planejamento" text DEFAULT '' NOT NULL,
	"stacks" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks_pessoais" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projeto_id" uuid,
	"titulo" text NOT NULL,
	"prazo" date,
	"done" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"titulo" text NOT NULL,
	"slug" text NOT NULL,
	"resumo" text DEFAULT '' NOT NULL,
	"corpo" text DEFAULT '' NOT NULL,
	"status" "post_status" DEFAULT 'rascunho' NOT NULL,
	"publicado_em" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "portfolio_itens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"titulo" text NOT NULL,
	"desc" text DEFAULT '' NOT NULL,
	"stack" text[] DEFAULT '{}' NOT NULL,
	"github" text DEFAULT '' NOT NULL,
	"link" text DEFAULT '' NOT NULL,
	"ordem" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expediente_pausas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expediente_id" uuid NOT NULL,
	"pausado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"retomado_em" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "expedientes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projetos" text[] NOT NULL,
	"iniciado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"encerrado_em" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "landing_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"freela_id" uuid,
	"modelo_id" text NOT NULL,
	"marca" text DEFAULT '' NOT NULL,
	"cor_acento" text DEFAULT '#818cf8' NOT NULL,
	"header_links" text DEFAULT 'Início, Serviços, Sobre, Contato' NOT NULL,
	"footer_texto" text DEFAULT '' NOT NULL,
	"footer_contato" text DEFAULT '' NOT NULL,
	"secoes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"gerado_em" timestamp with time zone,
	"arquivo_nome" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notificacoes_dismissidas" (
	"chave" text PRIMARY KEY NOT NULL,
	"dismissed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_freela_id_freelas_id_fk" FOREIGN KEY ("freela_id") REFERENCES "public"."freelas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "observacoes" ADD CONSTRAINT "observacoes_freela_id_freelas_id_fk" FOREIGN KEY ("freela_id") REFERENCES "public"."freelas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reunioes" ADD CONSTRAINT "reunioes_freela_id_freelas_id_fk" FOREIGN KEY ("freela_id") REFERENCES "public"."freelas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orcamento_itens" ADD CONSTRAINT "orcamento_itens_orcamento_id_orcamentos_id_fk" FOREIGN KEY ("orcamento_id") REFERENCES "public"."orcamentos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_freela_id_freelas_id_fk" FOREIGN KEY ("freela_id") REFERENCES "public"."freelas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_recursos" ADD CONSTRAINT "meta_recursos_meta_id_metas_id_fk" FOREIGN KEY ("meta_id") REFERENCES "public"."metas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_recursos" ADD CONSTRAINT "meta_recursos_orcamento_id_orcamentos_id_fk" FOREIGN KEY ("orcamento_id") REFERENCES "public"."orcamentos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks_pessoais" ADD CONSTRAINT "tasks_pessoais_projeto_id_projetos_pessoais_id_fk" FOREIGN KEY ("projeto_id") REFERENCES "public"."projetos_pessoais"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expediente_pausas" ADD CONSTRAINT "expediente_pausas_expediente_id_expedientes_id_fk" FOREIGN KEY ("expediente_id") REFERENCES "public"."expedientes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_freela_id_freelas_id_fk" FOREIGN KEY ("freela_id") REFERENCES "public"."freelas"("id") ON DELETE set null ON UPDATE no action;