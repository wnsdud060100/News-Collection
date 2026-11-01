ALTER TABLE "articles" DROP CONSTRAINT "articles_category_id_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "articles" ALTER COLUMN "category_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN "is_default";