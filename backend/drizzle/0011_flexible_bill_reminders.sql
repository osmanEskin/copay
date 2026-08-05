ALTER TABLE "bills" ADD COLUMN "reminder_days_before" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "bills" ADD COLUMN "reminder_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "bills" DROP COLUMN "reminder";
