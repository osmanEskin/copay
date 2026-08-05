ALTER TABLE "bills" ADD COLUMN "variable_amount" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "groups" ADD COLUMN "type" text DEFAULT 'diger' NOT NULL;