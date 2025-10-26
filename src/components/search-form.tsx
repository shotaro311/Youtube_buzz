'use client';

import { useState } from 'react';

export type SearchFormState = {
  keyword: string;
  region: 'jp' | 'global';
  minSubscribers: number;
  minViews: number;
  publishedWithin: 'any' | '7' | '30' | '90' | '180';
};

const defaultState: SearchFormState = {
  keyword: '',
  region: 'jp',
  minSubscribers: 100,
  minViews: 10000,
  publishedWithin: '30',
};

export function SearchForm({ onSubmit }: { onSubmit: (state: SearchFormState) => void }) {
  const [form, setForm] = useState<SearchFormState>(defaultState);
  const [showFilters, setShowFilters] = useState(false);

  return (
    <form
      className="flex flex-col gap-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
      onSubmit={event => {
        event.preventDefault();
        if (!form.keyword.trim()) {
          return;
        }
        onSubmit(form);
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
          value={form.keyword}
          onChange={event => setForm({ ...form, keyword: event.target.value })}
          className="rounded-xl border border-zinc-300 px-3 py-2 text-base shadow-inner focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-medium text-zinc-800" htmlFor="region">
          対象エリア
        </label>
        <select
          id="region"
          name="region"
          value={form.region}
          onChange={event =>
            setForm({ ...form, region: event.target.value as SearchFormState['region'] })
          }
          className="rounded-xl border border-zinc-300 px-3 py-2 text-base focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
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
              value={form.minSubscribers}
              onChange={event =>
                setForm({ ...form, minSubscribers: Number(event.target.value) || 0 })
              }
              className="rounded-lg border border-zinc-300 px-2 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
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
              value={form.minViews}
              onChange={event => setForm({ ...form, minViews: Number(event.target.value) || 0 })}
              className="rounded-lg border border-zinc-300 px-2 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-zinc-700" htmlFor="publishedWithin">
              公開からの日数
            </label>
            <select
              id="publishedWithin"
              value={form.publishedWithin}
              onChange={event =>
                setForm({
                  ...form,
                  publishedWithin: event.target.value as SearchFormState['publishedWithin'],
                })
              }
              className="rounded-lg border border-zinc-300 px-2 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
            >
              <option value="any">制限なし</option>
              <option value="7">直近7日</option>
              <option value="30">直近30日</option>
              <option value="90">直近90日</option>
              <option value="180">直近180日</option>
            </select>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-full bg-sky-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-500 disabled:bg-zinc-300"
          disabled={!form.keyword.trim()}
        >
          バズ動画を検索
        </button>
      </div>
    </form>
  );
}
