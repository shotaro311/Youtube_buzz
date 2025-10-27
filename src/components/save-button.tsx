'use client';

import { useTransition } from 'react';
import type { SaveRequestBody } from '@/lib/types';

interface SaveButtonProps {
  videoId: string;
  payload: SaveRequestBody;
  disabled?: boolean;
  onSaved?: (videoId: string) => void;
}

export function SaveButton({ videoId, payload, disabled, onSaved }: SaveButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={disabled || isPending}
      className="inline-flex items-center gap-2 rounded-full border border-sky-500 px-4 py-1 text-sm font-semibold text-sky-600 transition hover:bg-sky-50 disabled:border-zinc-300 disabled:text-zinc-400"
      onClick={() =>
        startTransition(async () => {
          const response = await fetch('/api/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const json = (await response.json().catch(() => null)) as { ok: boolean; message?: string } | null;
          if (!response.ok || !json?.ok) {
            const message = json?.message ?? '保存に失敗しました';
            alert(message);
            return;
          }
          onSaved?.(videoId);
        })
      }
    >
      {isPending ? '保存中...' : disabled ? '保存済み' : 'スプレッドシートに保存'}
    </button>
  );
}
