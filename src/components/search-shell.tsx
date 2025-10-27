'use client';

import { useMemo, useState } from 'react';
import type { SearchRequest, SearchResponseBody, VideoResult } from '@/lib/types';
import { ResultsGrid } from './results-grid';
import { SearchForm } from './search-form';
import { ResultsPlaceholder } from './results-placeholder';
import { SortSelect } from './sort-select';
import { SearchHistoryComponent } from './search-history';
import { sortVideos, type SortKey } from '@/lib/sort';

interface SearchState {
  status: 'idle' | 'loading' | 'success' | 'error';
  keyword: string;
  videos: VideoResult[];
  error?: string;
}

const initialState: SearchState = {
  status: 'idle',
  keyword: '',
  videos: [],
};

export function SearchShell() {
  const [state, setState] = useState<SearchState>(initialState);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>('growth');
  const [refreshHistoryKey, setRefreshHistoryKey] = useState(0);

  const handleSubmit = async (form: SearchRequest) => {
    setState(prev => ({ ...prev, status: 'loading', keyword: form.keyword, error: undefined }));
    setSaved(new Set());

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = (await response.json().catch(() => null)) as SearchResponseBody | { ok: false; message: string } | null;

      if (!response.ok || !json) {
        throw new Error('検索に失敗しました');
      }

      if (!json.ok) {
        throw new Error(json.message);
      }

      setState({ status: 'success', keyword: form.keyword, videos: json.videos });

      // 検索成功後、履歴を更新
      setRefreshHistoryKey(prev => prev + 1);
    } catch (error) {
      const message = error instanceof Error ? error.message : '検索に失敗しました';
      setState({ status: 'error', keyword: form.keyword, videos: [], error: message });
    }
  };

  const handleSaved = (videoId: string) => {
    setSaved(prev => new Set(prev).add(videoId));
  };

  const handleHistoryReuse = (searchRequest: SearchRequest) => {
    handleSubmit(searchRequest);
  };

  const sortedVideos = useMemo(() => {
    if (state.status !== 'success') return [] as VideoResult[];
    return sortVideos(state.videos, sortKey);
  }, [state, sortKey]);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        <SearchForm onSubmit={handleSubmit} />

        {state.status === 'loading' && (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
            集計中です。YouTube API 接続とキャッシュが完了すると結果が表示されます。
          </div>
        )}

        {state.status === 'error' && state.error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {state.error}
          </div>
        )}

        {state.status === 'idle' && <ResultsPlaceholder />}

        {state.status === 'success' && (
          <div className="space-y-4">
            <SortSelect value={sortKey} onChange={next => setSortKey(next)} />
            <ResultsGrid keyword={state.keyword} videos={sortedVideos} saved={saved} onSaved={handleSaved} />
          </div>
        )}
      </div>

      <aside className="space-y-4">
        <SearchHistoryComponent key={refreshHistoryKey} onReuse={handleHistoryReuse} />
      </aside>
    </div>
  );
}
