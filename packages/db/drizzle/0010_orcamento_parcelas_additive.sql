CREATE TYPE "public"."parcela_tipo" AS ENUM('aprovacao', 'entrega');--> statement-breakpoint
CREATE TABLE "orcamento_parcelas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"orcamento_id" uuid NOT NULL,
	"tipo" "parcela_tipo" NOT NULL,
	"valor" numeric(12, 2) NOT NULL,
	"pago" boolean DEFAULT false NOT NULL,
	"pago_em" timestamp with time zone,
	"faturado" boolean DEFAULT false NOT NULL,
	"percentual_imposto_nf" numeric(5, 2) DEFAULT '5' NOT NULL,
	"percentual_retencao_cliente" numeric(5, 2) DEFAULT '11' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orcamento_parcelas" ADD CONSTRAINT "orcamento_parcelas_orcamento_id_orcamentos_id_fk" FOREIGN KEY ("orcamento_id") REFERENCES "public"."orcamentos"("id") ON DELETE cascade ON UPDATE no action;