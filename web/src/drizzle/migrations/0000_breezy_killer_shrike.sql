ALTER TABLE "extension_tokens" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "question_options" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "questions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "subscriptions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "summaries" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_answers" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_question_progress" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "videos" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_id_fkey";
--> statement-breakpoint
ALTER TABLE "extension_tokens" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "user_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
DROP POLICY "Enable delete for users based on user_id" ON "extension_tokens" CASCADE;--> statement-breakpoint
DROP POLICY "Enable insert for users based on user_id" ON "extension_tokens" CASCADE;--> statement-breakpoint
DROP POLICY "Enable users to view their own data only" ON "extension_tokens" CASCADE;--> statement-breakpoint
DROP POLICY "Enable users to view their own data only" ON "users" CASCADE;