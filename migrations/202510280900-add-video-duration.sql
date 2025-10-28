ALTER TABLE search_history
  ADD COLUMN video_duration TEXT NOT NULL DEFAULT 'any';

ALTER TABLE search_history
  ADD COLUMN exclude_keywords TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_search_history_video_duration ON search_history(video_duration);
CREATE INDEX IF NOT EXISTS idx_search_history_exclude_keywords ON search_history(exclude_keywords);
