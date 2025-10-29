'use client';

import { useCallback, useEffect, useState } from 'react';
import type {
  SearchHistory,
  HistoryResponseBody,
  SearchRequest,
  DeleteHistoryResponseBody,
} from '@/lib/types';
import { formatDateTimeJst } from '@/lib/date';

interface SearchHistoryProps {
  onReuse: (searchRequest: SearchRequest) => void;
}

export function SearchHistoryComponent({ onReuse }: SearchHistoryProps) {
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadHistory = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (!silent) {
      setLoading(true);
      setError(null);
    }

    try {
      const response = await fetch('/api/history');
      const data = await response.json() as HistoryResponseBody;

      if (!data.ok) {
        throw new Error(data.message);
      }

      setHistory(data.history);
      if (!silent) {
        setError(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '履歴の取得に失敗しました';
      if (silent) {
        console.error('[SearchHistory] 履歴の再取得に失敗:', message);
      } else {
        setError(message);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

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
      excludeKeywords: item.excludeKeywords,
    };
    onReuse(searchRequest);
  };

  const handleDelete = async (id: number) => {
    const hasConfirm =
      typeof window !== 'undefined' && typeof window.confirm === 'function';
    if (hasConfirm) {
      const ok = window.confirm('この検索履歴を削除しますか？');
      if (!ok) {
        return;
      }
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/history/${id}`, { method: 'DELETE' });
      const data = await response.json().catch(() => null) as DeleteHistoryResponseBody | null;
      const isAlreadyRemoved =
        response.status === 404 &&
        data &&
        data.ok === false &&
        typeof data.message === 'string' &&
        data.message.toLowerCase().includes('not found');
      const isSuccess = (response.ok && data?.ok === true) || isAlreadyRemoved;
      if (!isSuccess) {
        const message =
          data && data.ok === false && data.message
            ? data.message
            : '削除に失敗しました';
        throw new Error(message);
      }
      setHistory(prev => prev.filter(entry => entry.id !== id));
      await loadHistory({ silent: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : '削除に失敗しました';
      alert(message);
    } finally {
      setDeletingId(current => (current === id ? null : current));
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
          type="button"
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
                    type="button"
                    className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity hover:bg-sky-700 group-hover:opacity-100"
                  >
                    再検索
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    type="button"
                    className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 opacity-0 transition-opacity hover:bg-rose-50 group-hover:opacity-100 disabled:cursor-wait disabled:opacity-60"
                  >
                    {deletingId === item.id ? '削除中…' : '削除'}
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
