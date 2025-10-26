'use client';

import { useState } from 'react';
import { ResultsPlaceholder } from './results-placeholder';
import { SearchForm, type SearchFormState } from './search-form';

export function SearchShell() {
  const [lastQuery, setLastQuery] = useState<SearchFormState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (form: SearchFormState) => {
    setIsSubmitting(true);
    setError(null);
    setLastQuery(form);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        throw new Error('検索 API は現在準備中です');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '検索に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SearchForm onSubmit={handleSubmit} />
      {isSubmitting && (
        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
          集計中です。YouTube API との接続を構築したらリロードせずに結果が反映されます。
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      <ResultsPlaceholder keyword={lastQuery?.keyword} />
    </div>
  );
}
