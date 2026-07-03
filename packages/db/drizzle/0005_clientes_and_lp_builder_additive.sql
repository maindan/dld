CREATE TABLE "clientes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"whatsapp" text DEFAULT '' NOT NULL,
	"empresa" text DEFAULT '' NOT NULL,
	"observacoes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "freelas" ADD COLUMN "cliente_id" uuid;--> statement-breakpoint
ALTER TABLE "landing_pages" ADD COLUMN "header" jsonb;--> statement-breakpoint
ALTER TABLE "landing_pages" ADD COLUMN "footer" jsonb;--> statement-breakpoint
ALTER TABLE "landing_pages" ADD COLUMN "whatsapp" jsonb;--> statement-breakpoint
ALTER TABLE "freelas" ADD CONSTRAINT "freelas_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE no action ON UPDATE no action;