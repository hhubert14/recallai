ALTER TABLE "extension_tokens" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "subscriptions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "extension_tokens" CASCADE;--> statement-breakpoint
DROP TABLE "subscriptions" CASCADE;--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_stripe_customer_id_unique";--> statement-breakpoint
DROP INDEX "idx_users_stripe_customer_id";--> statement-breakpoint
ALTER TABLE "question_options" DROP COLUMN "order_index";--> statement-breakpoint
ALTER TABLE "user_answers" DROP COLUMN "text_answer";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "is_subscribed";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "monthly_video_count";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "last_reset_date";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "processing_mode";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "stripe_customer_id";--> statement-breakpoint
ALTER TABLE "videos" DROP COLUMN "platform";--> statement-breakpoint
ALTER TABLE "videos" DROP COLUMN "duration";--> statement-breakpoint
ALTER TABLE "videos" DROP COLUMN "category";--> statement-breakpoint
ALTER TABLE "videos" DROP COLUMN "expiry_date";--> statement-breakpoint
ALTER TABLE "videos" DROP COLUMN "video_id";--> statement-breakpoint
ALTER TABLE "videos" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "videos" DROP COLUMN "deleted_at";--> statement-breakpoint
ALTER TABLE "videos" DROP COLUMN "should_expire";--> statement-breakpoint
DROP TYPE "public"."plan";--> statement-breakpoint
DROP TYPE "public"."platform";--> statement-breakpoint
DROP TYPE "public"."processing_mode";--> statement-breakpoint
DROP TYPE "public"."status";