-- =============================================================================
-- Enable Supabase Realtime for battle_rooms table
-- This allows clients to subscribe to INSERT, UPDATE, and DELETE events
-- =============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE battle_rooms;
  END IF;
END $$;
