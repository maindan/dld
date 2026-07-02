CREATE TYPE "public"."freela_status" AS ENUM('ativo', 'pausado', 'concluido', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."orcamento_status" AS ENUM('rascunho', 'enviado', 'aprovado', 'pago', 'recusado');--> statement-breakpoint
CREATE TABLE "freelas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"cliente" text NOT NULL,
	"status" "freela_status" DEFAULT 'ativo' NOT NULL,
	"cor_acento" text DEFAULT '#818cf8' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orcamentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"freela_id" uuid NOT NULL,
	"status" "orcamento_status" DEFAULT 'rascunho' NOT NULL,
	"valor" numeric(12, 2) NOT NULL,
	"token_publico" text NOT NULL,
	"aprovado_em" timestamp with time zone,
	"pago_em" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orcamentos_token_publico_unique" UNIQUE("token_publico")
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"freela_id" uuid,
	"titulo" text NOT NULL,
	"concluida" boolean DEFAULT false NOT NULL,
	"prazo" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_freela_id_freelas_id_fk" FOREIGN KEY ("freela_id") REFERENCES "public"."freelas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_freela_id_freelas_id_fk" FOREIGN KEY ("freela_id") REFERENCES "public"."freelas"("id") ON DELETE cascade ON UPDATE no action;