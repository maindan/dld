ALTER TABLE "freelas" ALTER COLUMN "cliente_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "landing_pages" ALTER COLUMN "header" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "landing_pages" ALTER COLUMN "footer" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "landing_pages" ALTER COLUMN "whatsapp" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "freelas" DROP COLUMN "cliente_nome";--> statement-breakpoint
ALTER TABLE "freelas" DROP COLUMN "cliente_email";--> statement-breakpoint
ALTER TABLE "freelas" DROP COLUMN "cliente_whatsapp";--> statement-breakpoint
ALTER TABLE "landing_pages" DROP COLUMN "marca";--> statement-breakpoint
ALTER TABLE "landing_pages" DROP COLUMN "logo_url";--> statement-breakpoint
ALTER TABLE "landing_pages" DROP COLUMN "header_links";--> statement-breakpoint
ALTER TABLE "landing_pages" DROP COLUMN "footer_texto";--> statement-breakpoint
ALTER TABLE "landing_pages" DROP COLUMN "footer_contato";