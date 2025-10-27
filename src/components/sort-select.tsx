import type { SortKey } from '@/lib/sort';

interface SortSelectProps {
  value: SortKey;
  onChange: (key: SortKey) => void;
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <label className="flex w-full max-w-xs items-center gap-3 text-sm text-zinc-600">
      <span className="whitespace-nowrap">並び替え:</span>
      <select
        className="flex-1 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
        value={value}
        onChange={event => onChange(event.target.value as SortKey)}
      >
        <option value="growth">伸び率スコア</option>
        <option value="publishedAt">投稿日</option>
        <option value="views">再生数</option>
        <option value="subscribers">登録者数</option>
        <option value="channelPublishedAt">チャンネル開設日</option>
      </select>
    </label>
  );
}
