import { NextResponse } from 'next/server';
import { sanitizeVideoResult } from '@/lib/validators';
import { fetchVideos } from '@/lib/youtube';
import { parseSearchRequest } from '@/lib/validators';
import type { SearchErrorBody, SearchResponseBody } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const searchRequest = parseSearchRequest(body);

    const videos = await fetchVideos(searchRequest);
    const sanitized = videos.map(sanitizeVideoResult);

    return NextResponse.json({ ok: true, videos: sanitized } satisfies SearchResponseBody);
  } catch (error) {
    const message = error instanceof Error ? error.message : '検索に失敗しました';
    const payload: SearchErrorBody = { ok: false, message };
    const status = message.includes('必須') || message.includes('不正') ? 400 : 500;
    return NextResponse.json(payload satisfies SearchErrorBody, { status });
  }
}
