-- =============================================================================
-- TRIGGER FUNCTION: Auto-update updated_at column on row modification
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGERS FOR EXISTING TABLES
-- =============================================================================
CREATE TRIGGER update_videos_updated_at
    BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_summaries_updated_at
    BEFORE UPDATE ON summaries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_question_progress_updated_at
    BEFORE UPDATE ON user_question_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- EVENT TRIGGER: Auto-add updated_at trigger to new tables (Open/Closed Principle)
-- =============================================================================
CREATE OR REPLACE FUNCTION auto_add_updated_at_trigger()
RETURNS event_trigger AS $$
DECLARE
    obj record;
    tbl_name text;
BEGIN
    FOR obj IN SELECT * FROM pg_event_trigger_ddl_commands() WHERE command_tag = 'CREATE TABLE'
    LOOP
        -- Extract table name from schema-qualified identifier (e.g., "public.my_table" -> "my_table")
        tbl_name := split_part(obj.object_identity, '.', 2);

        -- Only add trigger if table has updated_at column
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = tbl_name
              AND column_name = 'updated_at'
        ) THEN
            EXECUTE format(
                'CREATE TRIGGER update_%I_updated_at
                 BEFORE UPDATE ON public.%I
                 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
                tbl_name, tbl_name
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE EVENT TRIGGER add_updated_at_trigger_on_create
ON ddl_command_end
WHEN TAG IN ('CREATE TABLE')
EXECUTE FUNCTION auto_add_updated_at_trigger();
