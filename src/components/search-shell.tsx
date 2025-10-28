'use client';

import { useEffect, useMemo, useState } from 'react';
import type { SearchRequest, SearchResponseBody, VideoResult } from '@/lib/types';
import { ResultsGrid } from './results-grid';
import { SearchForm, defaultSearchFormState } from './search-form';
import { ResultsPlaceholder } from './results-placeholder';
import { SortSelect } from './sort-select';
import { SearchHistoryComponent } from './search-history';
import { sortVideos, type SortKey } from '@/lib/sort';
import { SavedResultsList, SavedResultsModal, type SavedResultSet } from './saved-results';

interface SearchState {
  status: 'idle' | 'loading' | 'success' | 'error';
  keyword: string;
  videos: VideoResult[];
  request?: SearchRequest;
  error?: string;
}

const initialState: SearchState = {
  status: 'idle',
  keyword: '',
  videos: [],
};

const SAVED_RESULTS_STORAGE_KEY = 'youtube-buzz-search-results';

export function SearchShell() {
  const [state, setState] = useState<SearchState>(initialState);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>('growth');
  const [refreshHistoryKey, setRefreshHistoryKey] = useState(0);
  const [formState, setFormState] = useState<SearchRequest>({ ...defaultSearchFormState });
  const [savedResults, setSavedResults] = useState<SavedResultSet[]>([]);
  const [modalItem, setModalItem] = useState<SavedResultSet | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const raw = window.localStorage.getItem(SAVED_RESULTS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedResultSet[];
        setSavedResults(parsed);
      }
    } catch (error) {
      console.error('Failed to load saved results:', error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(SAVED_RESULTS_STORAGE_KEY, JSON.stringify(savedResults));
  }, [savedResults]);

  const handleSubmit = async (form: SearchRequest) => {
    const normalizedForm: SearchRequest = { ...form };
    setState(prev => ({
      ...prev,
      status: 'loading',
      keyword: normalizedForm.keyword,
      error: undefined,
      request: normalizedForm,
    }));
    setSaved(new Set());

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(normalizedForm),
      });
      const json = (await response.json().catch(() => null)) as SearchResponseBody | { ok: false; message: string } | null;

      if (!response.ok || !json) {
        throw new Error('検索に失敗しました');
      }

      if (!json.ok) {
        throw new Error(json.message);
      }

      setState({
        status: 'success',
        keyword: normalizedForm.keyword,
        videos: json.videos,
        request: normalizedForm,
      });

      // 検索成功後、履歴を更新
      setRefreshHistoryKey(prev => prev + 1);
    } catch (error) {
      const message = error instanceof Error ? error.message : '検索に失敗しました';
      setState({
        status: 'error',
        keyword: normalizedForm.keyword,
        videos: [],
        error: message,
        request: normalizedForm,
      });
    }
  };

  const handleSaved = (videoId: string) => {
    setSaved(prev => new Set(prev).add(videoId));
  };

  const handleHistoryReuse = (searchRequest: SearchRequest) => {
    setFormState({ ...searchRequest });
  };

  const handleSaveCurrentResults = () => {
    if (state.status !== 'success' || state.videos.length === 0) {
      alert('保存できる検索結果がありません');
      return;
    }

    const videos = sortVideos(state.videos, sortKey);
    const entry: SavedResultSet = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      keyword: state.keyword,
      createdAt: new Date().toISOString(),
      videos,
      searchRequest: state.request ? { ...state.request } : { ...formState },
    };

    setSavedResults(prev => {
      const next = [entry, ...prev];
      return next.slice(0, 10);
    });
    alert('検索結果を保存しました');
  };

  const handleDeleteSaved = (id: string) => {
    setSavedResults(prev => prev.filter(item => item.id !== id));
  };

  const handleViewSaved = (item: SavedResultSet) => {
    setModalItem(item);
  };

  const closeModal = () => setModalItem(null);

  const sortedVideos = useMemo(() => {
    if (state.status !== 'success') return [] as VideoResult[];
    return sortVideos(state.videos, sortKey);
  }, [state, sortKey]);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        <SearchForm value={formState} onChange={setFormState} onSubmit={handleSubmit} />

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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SortSelect value={sortKey} onChange={next => setSortKey(next)} />
              <button
                type="button"
                onClick={handleSaveCurrentResults}
                className="inline-flex items-center justify-center rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-400 disabled:bg-zinc-300"
                disabled={state.videos.length === 0}
              >
                検索結果を保存
              </button>
            </div>
            <ResultsGrid keyword={state.keyword} videos={sortedVideos} saved={saved} onSaved={handleSaved} />
          </div>
        )}
      </div>

      <aside className="space-y-4">
        <SearchHistoryComponent key={refreshHistoryKey} onReuse={handleHistoryReuse} />
        <SavedResultsList items={savedResults} onView={handleViewSaved} onDelete={handleDeleteSaved} />
      </aside>
      <SavedResultsModal item={modalItem} onClose={closeModal} />
    </div>
  );
}
