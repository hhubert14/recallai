-- =============================================================================
-- Enable Supabase Realtime for battle_rooms table
-- This allows clients to subscribe to INSERT, UPDATE, and DELETE events
-- =============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (
       SELECT 1
         FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'battle_rooms'
     ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_rooms;
  END IF;
END $$;
