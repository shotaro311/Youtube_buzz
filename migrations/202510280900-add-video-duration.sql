ALTER TABLE search_history
  ADD COLUMN video_duration TEXT NOT NULL DEFAULT 'any';

CREATE INDEX IF NOT EXISTS idx_search_history_video_duration ON search_history(video_duration);
