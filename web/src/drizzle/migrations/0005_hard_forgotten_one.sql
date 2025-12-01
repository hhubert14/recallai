CREATE TABLE "onboarding_surveys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"answers" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "onboarding_surveys_user_id_key" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "onboarding_surveys" ADD CONSTRAINT "onboarding_surveys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;