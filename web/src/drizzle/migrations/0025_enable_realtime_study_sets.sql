-- =============================================================================
-- Enable Supabase Realtime for study_sets table
-- This allows clients to subscribe to INSERT, UPDATE, and DELETE events
-- =============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE study_sets;
