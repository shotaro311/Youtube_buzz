'use client';

import { useState } from 'react';
import type { SearchRequest, ExcludableDuration } from '@/lib/types';

interface SearchFormProps {
  value: SearchRequest;
  onChange: (patch: Partial<SearchRequest>) => void;
  onSubmit: (state: SearchRequest) => void;
}

export function SearchForm({ value, onChange, onSubmit }: SearchFormProps) {
  const [showFilters, setShowFilters] = useState(false);

  const update = (partial: Partial<SearchRequest>) => {
    onChange(partial);
  };

  return (
    <form
      className="flex flex-col gap-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
      onSubmit={event => {
        event.preventDefault();
        if (!value.keyword.trim()) {
          return;
        }
        onSubmit(value);
      }}
    >
      <div className="flex flex-col gap-2">
        <label className="font-medium text-zinc-800" htmlFor="keyword">
          検索キーワード
        </label>
        <input
          id="keyword"
          name="keyword"
          required
          placeholder="例: キャンプ ギア"
          value={value.keyword}
          onChange={event => update({ keyword: event.target.value })}
          className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-medium text-zinc-800" htmlFor="excludeKeywords">
          除外キーワード
        </label>
        <input
          id="excludeKeywords"
          name="excludeKeywords"
          placeholder="例: リーク,ネタバレ"
          value={value.excludeKeywords}
          onChange={event => update({ excludeKeywords: event.target.value })}
          className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
        />
        <p className="text-xs text-zinc-500">カンマ区切りで複数指定可能</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-medium text-zinc-800" htmlFor="region">
          対象エリア
        </label>
        <select
          id="region"
          name="region"
          value={value.region}
          onChange={event => update({ region: event.target.value as SearchRequest['region'] })}
          className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
        >
          <option value="jp">日本のみ</option>
          <option value="global">全世界</option>
        </select>
      </div>

      <button
        type="button"
        className="flex items-center gap-2 text-sm font-medium text-sky-600"
        onClick={() => setShowFilters(current => !current)}
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-sky-100 bg-sky-50 text-sky-600">
          {showFilters ? '−' : '+'}
        </span>
        詳細フィルタを{showFilters ? '閉じる' : '開く'}
      </button>

      {showFilters && (
        <div className="grid gap-4 rounded-2xl bg-sky-50/60 p-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-zinc-700" htmlFor="minSubscribers">
              最低チャンネル登録者数
            </label>
            <input
              id="minSubscribers"
              type="number"
              min={0}
              value={value.minSubscribers}
              onChange={event => update({ minSubscribers: Number(event.target.value) || 0 })}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-zinc-700" htmlFor="minViews">
              最低再生数
            </label>
            <input
              id="minViews"
              type="number"
              min={0}
              value={value.minViews}
              onChange={event => update({ minViews: Number(event.target.value) || 0 })}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-zinc-700" htmlFor="maxSubscribers">
              最大チャンネル登録者数
            </label>
            <input
              id="maxSubscribers"
              type="number"
              min={0}
              value={value.maxSubscribers ?? ''}
              onChange={event =>
                update({
                  maxSubscribers:
                    event.target.value === '' ? null : Number(event.target.value) || 0,
                })
              }
              placeholder="上限なし"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-zinc-700" htmlFor="maxViews">
              最大再生数
            </label>
            <input
              id="maxViews"
              type="number"
              min={0}
              value={value.maxViews ?? ''}
              onChange={event =>
                update({
                  maxViews: event.target.value === '' ? null : Number(event.target.value) || 0,
                })
              }
              placeholder="上限なし"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-zinc-700" htmlFor="publishedWithin">
              公開からの日数
            </label>
            <select
              id="publishedWithin"
              value={value.publishedWithin}
              onChange={event =>
                update({
                  publishedWithin: event.target.value as SearchRequest['publishedWithin'],
                })
              }
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            >
              <option value="any">制限なし</option>
              <option value="7">直近7日</option>
              <option value="30">直近30日</option>
              <option value="90">直近90日</option>
              <option value="180">直近180日</option>
            </select>
          </div>
          <div className="flex flex-col gap-2 sm:col-span-3">
            <label className="text-sm font-medium text-zinc-700">除外する動画の長さ</label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value.excludeDurations.includes('short')}
                  onChange={event => {
                    const newExcludeDurations = event.target.checked
                      ? [...value.excludeDurations, 'short' as ExcludableDuration]
                      : value.excludeDurations.filter(d => d !== 'short');
                    update({ excludeDurations: newExcludeDurations });
                  }}
                  className="h-4 w-4 rounded border border-sky-200 text-sky-600 focus:ring-sky-500"
                />
                <span className="text-sm text-zinc-700">ショート (4分未満)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value.excludeDurations.includes('medium')}
                  onChange={event => {
                    const newExcludeDurations = event.target.checked
                      ? [...value.excludeDurations, 'medium' as ExcludableDuration]
                      : value.excludeDurations.filter(d => d !== 'medium');
                    update({ excludeDurations: newExcludeDurations });
                  }}
                  className="h-4 w-4 rounded border border-sky-200 text-sky-600 focus:ring-sky-500"
                />
                <span className="text-sm text-zinc-700">ミドル (4〜20分)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value.excludeDurations.includes('long')}
                  onChange={event => {
                    const newExcludeDurations = event.target.checked
                      ? [...value.excludeDurations, 'long' as ExcludableDuration]
                      : value.excludeDurations.filter(d => d !== 'long');
                    update({ excludeDurations: newExcludeDurations });
                  }}
                  className="h-4 w-4 rounded border border-sky-200 text-sky-600 focus:ring-sky-500"
                />
                <span className="text-sm text-zinc-700">ロング (20分以上)</span>
              </label>
            </div>
            <p className="text-xs text-zinc-500">※ショート動画（60秒以下）は常に除外されます</p>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-full bg-sky-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-500 disabled:bg-zinc-300"
          disabled={!value.keyword.trim()}
        >
          バズ動画を検索
        </button>
      </div>
    </form>
  );
}
