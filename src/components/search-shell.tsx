'use client';

import { ResultsGrid } from './results-grid';
import { SearchForm } from './search-form';
import { ResultsPlaceholder } from './results-placeholder';
import { SortSelect } from './sort-select';
import {
  SavedResultsList,
  SavedResultsModal,
} from './saved-results';
import { useSearchExperience } from '@/lib/hooks/use-search-experience';

const noticeStyles: Record<'success' | 'error' | 'info', string> = {
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-700',
  error: 'border-rose-200 bg-rose-50 text-rose-700',
  info: 'border-sky-200 bg-sky-50 text-sky-700',
};

export function SearchShell() {
  const {
    form,
    updateForm,
    submitSearch,
    status,
    error,
    keyword,
    sortedVideos,
    sortKey,
    setSortKey,
    currentSavedIds,
    markVideoSaved,
    saveCurrentResults,
    savedResults,
    deleteSavedResult,
    openSavedModal,
    closeSavedModal,
    modalItem,
    notice,
    dismissNotice,
  } = useSearchExperience();

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        <SearchForm
          value={form}
          onChange={updateForm}
          onSubmit={() => {
            void submitSearch();
          }}
        />

        {notice && (
          <div
            className={`flex items-start justify-between gap-4 rounded-2xl border px-4 py-3 text-sm ${noticeStyles[notice.type]}`}
          >
            <span>{notice.message}</span>
            <button
              type="button"
              onClick={dismissNotice}
              className="text-xs font-medium underline-offset-2 hover:underline"
            >
              閉じる
            </button>
          </div>
        )}

        {status === 'loading' && (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
            集計中です。YouTube API 接続とキャッシュが完了すると結果が表示されます。
          </div>
        )}

        {status === 'error' && error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {status === 'idle' && <ResultsPlaceholder />}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SortSelect
                value={sortKey}
                onChange={setSortKey}
              />
              <button
                type="button"
                onClick={saveCurrentResults}
                className="inline-flex items-center justify-center rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-400 disabled:bg-zinc-300"
                disabled={sortedVideos.length === 0}
              >
                検索結果を保存
              </button>
            </div>
            <ResultsGrid
              keyword={keyword}
              videos={sortedVideos}
              saved={currentSavedIds}
              onSaved={markVideoSaved}
            />
          </div>
        )}
      </div>

      <aside>
        <SavedResultsList
          items={savedResults}
          onView={openSavedModal}
          onDelete={deleteSavedResult}
        />
      </aside>
      <SavedResultsModal
        key={modalItem?.id ?? 'empty'}
        item={modalItem}
        onClose={closeSavedModal}
      />
    </div>
  );
}
