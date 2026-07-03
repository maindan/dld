ALTER TABLE "orcamentos" ADD COLUMN "faturado" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "orcamentos" ADD COLUMN "percentual_imposto_nf" numeric(5, 2) DEFAULT '5' NOT NULL;--> statement-breakpoint
ALTER TABLE "orcamentos" ADD COLUMN "percentual_retencao_cliente" numeric(5, 2) DEFAULT '11' NOT NULL;