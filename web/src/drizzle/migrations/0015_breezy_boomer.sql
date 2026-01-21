ALTER TABLE "videos" ADD COLUMN "public_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_public_id_key" UNIQUE("public_id");