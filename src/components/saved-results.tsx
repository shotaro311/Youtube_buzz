'use client';

import { useEffect, useState } from 'react';
import { formatDateTimeJst } from '@/lib/date';
import type { SaveRequestBody, SearchRequest, VideoResult } from '@/lib/types';
import { SaveButton } from './save-button';

export interface SavedResultSet {
  id: string;
  keyword: string;
  createdAt: string;
  searchRequest: SearchRequest;
  videos: VideoResult[];
}

interface SavedResultsListProps {
  items: SavedResultSet[];
  onView: (item: SavedResultSet) => void;
  onDelete: (id: string) => void;
}

export function SavedResultsList({ items, onView, onDelete }: SavedResultsListProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">保存データ</h2>
        <span className="text-xs text-zinc-400">{items.length}/10</span>
      </div>
      {items.length === 0 ? (
        <div className="text-sm text-zinc-500">まだ保存された検索結果はありません</div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div
              key={item.id}
              className="rounded-lg border border-zinc-200 bg-zinc-50 p-3"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-zinc-900">{item.keyword || '（キーワードなし）'}</div>
                  <div className="text-xs text-zinc-500">{formatDateTimeJst(item.createdAt)} · {item.videos.length}件</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onView(item)}
                  className="inline-flex flex-1 items-center justify-center rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-500"
                >
                  詳細
                </button>
                <button
                  type="button"
                  onClick={() => onView(item)}
                  className="inline-flex flex-1 items-center justify-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="inline-flex items-center justify-center rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface SavedResultsModalProps {
  item: SavedResultSet | null;
  onClose: () => void;
}

export function SavedResultsModal({ item, onClose }: SavedResultsModalProps) {
  if (!item) {
    return null;
  }

  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSavedIds(new Set());
  }, [item.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900">保存済み検索結果</h3>
            <p className="text-sm text-zinc-500">{formatDateTimeJst(item.createdAt)} · {item.videos.length}件</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-zinc-200 px-3 py-1 text-sm text-zinc-600 hover:bg-zinc-100"
          >
            閉じる
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
          <div className="mb-4 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-600">
            <div className="font-medium text-zinc-800">検索条件</div>
            <ul className="mt-2 space-y-1">
              <li>キーワード: {item.searchRequest.keyword || '（未入力）'}</li>
              <li>対象エリア: {item.searchRequest.region === 'jp' ? '日本のみ' : '全世界'}</li>
              <li>最低登録者数: {item.searchRequest.minSubscribers}</li>
              <li>最低再生数: {item.searchRequest.minViews}</li>
              <li>最大登録者数: {item.searchRequest.maxSubscribers ?? '指定なし'}</li>
              <li>最大再生数: {item.searchRequest.maxViews ?? '指定なし'}</li>
              <li>公開からの日数: {formatPublishedWithin(item.searchRequest.publishedWithin)}</li>
              <li>動画の長さ: {formatVideoDuration(item.searchRequest.videoDuration)}</li>
              <li>除外キーワード: {item.searchRequest.excludeKeywords || 'なし'}</li>
              <li>ショート動画を含める: {item.searchRequest.includeShorts ? 'はい' : 'いいえ'}</li>
            </ul>
          </div>
          <div className="space-y-3">
            {item.videos.map(video => (
              <article key={video.videoId} className="rounded-2xl border border-zinc-200 p-4">
                <div className="flex flex-col gap-3">
                  {video.thumbnailUrl && (
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block overflow-hidden rounded-xl"
                    >
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="h-40 w-full object-cover"
                      />
                    </a>
                  )}
                  <a
                    href={video.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-semibold text-sky-600 hover:underline"
                  >
                    {video.title}
                  </a>
                  <div className="text-sm text-zinc-500">
                    {video.channelName} · {formatDateTimeJst(video.publishedAt)}
                  </div>
                  <div className="text-sm text-zinc-600">
                    再生数 {video.views.toLocaleString()} / 登録者 {video.subscribers.toLocaleString()} / 伸び率 {video.growthScore.toFixed(2)}
                  </div>
                  <div className="flex justify-end">
                    <SaveButton
                      videoId={video.videoId}
                      payload={buildSavePayload(video, item.keyword)}
                      disabled={savedIds.has(video.videoId)}
                      onSaved={videoId => setSavedIds(prev => new Set(prev).add(videoId))}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatPublishedWithin(value: SearchRequest['publishedWithin']): string {
  switch (value) {
    case 'any':
      return '制限なし';
    case '7':
      return '直近7日';
    case '30':
      return '直近30日';
    case '90':
      return '直近90日';
    case '180':
      return '直近180日';
    default:
      return value;
  }
}

function formatVideoDuration(value: SearchRequest['videoDuration']): string {
  switch (value) {
    case 'short':
      return 'ショート (4分未満)';
    case 'medium':
      return 'ミドル (4〜20分)';
    case 'long':
      return 'ロング (20分以上)';
    default:
      return '指定なし';
  }
}

function buildSavePayload(video: VideoResult, keyword: string): SaveRequestBody {
  const addedAt = formatDateTimeJst(new Date());
  const publishedAtDisplay = formatDateTimeJst(video.publishedAt);
  const channelPublishedAtDisplay = video.channelPublishedAt
    ? formatDateTimeJst(video.channelPublishedAt)
    : '';

  return {
    addedAt,
    keyword,
    title: video.title,
    videoUrl: video.videoUrl,
    channelName: video.channelName,
    channelUrl: video.channelUrl,
    views: video.views,
    subscribers: video.subscribers,
    publishedAt: publishedAtDisplay,
    growthScore: video.growthScore,
    channelPublishedAt: channelPublishedAtDisplay,
    memo: '',
  };
}
