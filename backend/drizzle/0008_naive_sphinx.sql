ALTER TABLE "settlements" ADD COLUMN "method" text DEFAULT 'cash' NOT NULL;--> statement-breakpoint
ALTER TABLE "settlements" ADD COLUMN "note" text;