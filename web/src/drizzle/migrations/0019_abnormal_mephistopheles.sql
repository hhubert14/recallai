ALTER TABLE "reviewable_items" ALTER COLUMN "study_set_id" SET NOT NULL;

-- Ensure one study set per video (partial unique index for non-null video_id)
CREATE UNIQUE INDEX idx_study_sets_video_id_unique
ON study_sets(video_id)
WHERE video_id IS NOT NULL;