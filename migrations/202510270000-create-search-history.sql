-- 検索履歴テーブル
CREATE TABLE IF NOT EXISTS search_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword TEXT NOT NULL,
  region TEXT NOT NULL,
  min_subscribers INTEGER NOT NULL DEFAULT 0,
  max_subscribers INTEGER,
  min_views INTEGER NOT NULL DEFAULT 0,
  max_views INTEGER,
  published_within TEXT NOT NULL,
  include_shorts BOOLEAN NOT NULL DEFAULT 1,
  result_count INTEGER NOT NULL DEFAULT 0,
  searched_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_search_history_searched_at ON search_history(searched_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_history_keyword ON search_history(keyword);

-- 検索結果の詳細テーブル
CREATE TABLE IF NOT EXISTS search_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  history_id INTEGER NOT NULL,
  video_id TEXT NOT NULL,
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  channel_url TEXT NOT NULL,
  views INTEGER NOT NULL,
  subscribers INTEGER NOT NULL,
  published_at TEXT NOT NULL,
  channel_published_at TEXT NOT NULL,
  growth_score REAL NOT NULL,
  is_short BOOLEAN NOT NULL DEFAULT 0,
  FOREIGN KEY (history_id) REFERENCES search_history(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_search_results_history_id ON search_results(history_id);
CREATE INDEX IF NOT EXISTS idx_search_results_video_id ON search_results(video_id);
