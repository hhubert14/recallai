-- Backfill any auth.users missing from public.users
INSERT INTO public.users (id, email, created_at)
SELECT au.id, au.email, au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;--> statement-breakpoint
-- Delete orphaned public.users records (no matching auth.users)
DELETE FROM public.users
WHERE id NOT IN (SELECT id FROM auth.users);--> statement-breakpoint
-- Add foreign key constraint with cascade delete
ALTER TABLE public.users
  ADD CONSTRAINT users_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id)
  ON DELETE CASCADE;
