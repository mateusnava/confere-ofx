ALTER TABLE "users" ADD COLUMN "credits" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "free_conversion_used" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "credit_source" text;
--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_mercado_pago_id_unique" UNIQUE("mercado_pago_id");
