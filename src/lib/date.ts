import type { PublishedWithin } from './types';

export function getPublishedAfterFilter(days: PublishedWithin): string | undefined {
  if (days === 'any') return undefined;
  const amount = Number(days);
  if (!Number.isFinite(amount) || amount <= 0) return undefined;
  const date = new Date(Date.now() - amount * 24 * 60 * 60 * 1000);
  return date.toISOString();
}

export function formatDateTimeJst(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '不明';
  }
  return date.toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
