ALTER TABLE "expenses" ADD COLUMN "group_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "split_method" text DEFAULT 'equal' NOT NULL;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;