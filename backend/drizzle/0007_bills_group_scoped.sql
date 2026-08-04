ALTER TABLE "bills" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "bills" ADD COLUMN "group_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "bills" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "bills" ADD COLUMN "bill_date" date NOT NULL;--> statement-breakpoint
ALTER TABLE "bills" ADD COLUMN "split_method" text DEFAULT 'equal' NOT NULL;--> statement-breakpoint
ALTER TABLE "bills" ADD COLUMN "recurrence" text DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "bills" ADD COLUMN "reminder" text DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "bills" ADD COLUMN "paid_at" timestamp;--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE TABLE "bill_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bill_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"share_amount" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bill_participants" ADD CONSTRAINT "bill_participants_bill_id_bills_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."bills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bill_participants" ADD CONSTRAINT "bill_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
