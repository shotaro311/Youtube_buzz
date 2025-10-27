import { NextResponse } from 'next/server';
import type { SaveRequestBody, SaveResponseBody } from '@/lib/types';

const COLUMN_ORDER: Array<keyof SaveRequestBody> = [
  'addedAt',
  'keyword',
  'title',
  'videoUrl',
  'views',
  'publishedAt',
  'growthScore',
  'channelName',
  'channelUrl',
  'subscribers',
  'channelPublishedAt',
  'memo',
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = validate(body);

    const endpoint = process.env.GAS_ENDPOINT_URL;
    if (!endpoint) {
      throw new Error('GAS_ENDPOINT_URL が未設定です');
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toArray(payload)),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`GAS 連携に失敗しました (${response.status}): ${text}`);
    }

    const json = (await response.json().catch(() => null)) as SaveResponseBody | null;
    if (json && !json.ok) {
      throw new Error(json.message ?? 'GAS 連携でエラーが発生しました');
    }

    return NextResponse.json({ ok: true } satisfies SaveResponseBody);
  } catch (error) {
    const message = error instanceof Error ? error.message : '保存に失敗しました';
    return NextResponse.json({ ok: false, message } satisfies SaveResponseBody, { status: 400 });
  }
}

function validate(input: unknown): SaveRequestBody {
  if (!input || typeof input !== 'object') {
    throw new Error('リクエスト形式が不正です');
  }

  const data = input as Record<string, unknown>;
  const missing = COLUMN_ORDER.filter(key => data[key] === undefined || data[key] === null);
  if (missing.length > 0) {
    throw new Error(`必要なフィールドが不足しています: ${missing.join(', ')}`);
  }

  const views = Number(data.views);
  const subscribers = Number(data.subscribers);
  const growthScore = Number(data.growthScore);
  if (![views, subscribers, growthScore].every(Number.isFinite)) {
    throw new Error('数値フィールドの形式が不正です');
  }

  return {
    addedAt: String(data.addedAt),
    keyword: String(data.keyword),
    title: String(data.title),
    videoUrl: String(data.videoUrl),
    channelName: String(data.channelName),
    channelUrl: String(data.channelUrl),
    views,
    subscribers,
    publishedAt: String(data.publishedAt),
    growthScore,
    channelPublishedAt: String(data.channelPublishedAt),
    memo: String(data.memo ?? ''),
  };
}

function toArray(data: SaveRequestBody) {
  return COLUMN_ORDER.map(key => data[key]);
}
