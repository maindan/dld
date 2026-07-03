CREATE TYPE "public"."contrato_modelo_tipo" AS ENUM('prestacao', 'confidencialidade', 'manutencao');--> statement-breakpoint
CREATE TYPE "public"."contrato_modo" AS ENUM('modelo', 'anexo');--> statement-breakpoint
ALTER TABLE "contratos" ADD COLUMN "modo" "contrato_modo" DEFAULT 'modelo' NOT NULL;--> statement-breakpoint
ALTER TABLE "contratos" ADD COLUMN "modelo_tipo" "contrato_modelo_tipo";--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "capa_url" text;--> statement-breakpoint
ALTER TABLE "portfolio_itens" ADD COLUMN "imagem" text;