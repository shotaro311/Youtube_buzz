'use client';

import { useEffect, useState } from 'react';
import type { SearchHistory, HistoryResponseBody, SearchRequest } from '@/lib/types';
import { formatDateTimeJst } from '@/lib/date';

interface SearchHistoryProps {
  onReuse: (searchRequest: SearchRequest) => void;
}

export function SearchHistoryComponent({ onReuse }: SearchHistoryProps) {
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/history');
      const data = await response.json() as HistoryResponseBody;

      if (!data.ok) {
        throw new Error(data.message);
      }

      setHistory(data.history);
    } catch (err) {
      const message = err instanceof Error ? err.message : '履歴の取得に失敗しました';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReuse = (item: SearchHistory) => {
    const searchRequest: SearchRequest = {
      keyword: item.keyword,
      region: item.region,
      minSubscribers: item.minSubscribers,
      maxSubscribers: item.maxSubscribers,
      minViews: item.minViews,
      maxViews: item.maxViews,
      publishedWithin: item.publishedWithin,
      videoDuration: item.videoDuration,
      includeShorts: item.includeShorts,
    };
    onReuse(searchRequest);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('この検索履歴を削除しますか？')) {
      return;
    }
    try {
      const response = await fetch(`/api/history/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || '削除に失敗しました');
      }
      setHistory(prev => prev.filter(entry => entry.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : '削除に失敗しました';
      alert(message);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">検索履歴</h2>
        <div className="text-sm text-zinc-500">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">検索履歴</h2>
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">検索履歴</h2>
        <div className="text-sm text-zinc-500">まだ検索履歴がありません</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">検索履歴</h2>
        <button
          onClick={loadHistory}
          className="text-sm text-sky-600 hover:text-sky-700"
        >
          更新
        </button>
      </div>

      <div className="space-y-3">
        {history.map((item) => (
          <div
            key={item.id}
            className="group rounded-lg border border-zinc-200 bg-zinc-50 p-3 transition-colors hover:border-sky-300 hover:bg-sky-50"
          >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-medium text-zinc-900">{item.keyword}</span>
                    <span className="rounded bg-zinc-200 px-2 py-0.5 text-xs text-zinc-600">
                      {item.region === 'jp' ? '日本' : 'グローバル'}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500">
                    {formatDateTimeJst(item.searchedAt)} · {item.resultCount}件 · {durationLabel(item.videoDuration)} · {item.excludeKeywords ? `除外: ${item.excludeKeywords}` : '除外なし'}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => handleReuse(item)}
                    className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity hover:bg-sky-700 group-hover:opacity-100"
                  >
                    再検索
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 opacity-0 transition-opacity hover:bg-rose-50 group-hover:opacity-100"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
  );
}

function durationLabel(duration: SearchHistory['videoDuration']): string {
  switch (duration) {
    case 'short':
      return 'ショート';
    case 'medium':
      return 'ミドル';
    case 'long':
      return 'ロング';
    default:
      return '長さ指定なし';
  }
}
