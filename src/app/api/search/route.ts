import { NextResponse } from 'next/server';
import { sanitizeVideoResult } from '@/lib/validators';
import { fetchVideos } from '@/lib/youtube';
import { parseSearchRequest } from '@/lib/validators';
import type { SearchErrorBody, SearchResponseBody, SaveHistoryRequest, SearchRequest, VideoResult } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const searchRequest = parseSearchRequest(body);

    const videos = await fetchVideos(searchRequest);
    const sanitized = videos.map(sanitizeVideoResult);
    const filteredVideos = searchRequest.includeShorts
      ? sanitized
      : sanitized.filter(video => !video.isShort);

    // 検索履歴を非同期で保存（失敗してもエラーにしない）
    saveHistoryAsync(searchRequest, filteredVideos).catch(error => {
      console.error('Failed to save search history:', error);
    });

    return NextResponse.json({ ok: true, videos: filteredVideos } satisfies SearchResponseBody);
  } catch (error) {
    const message = error instanceof Error ? error.message : '検索に失敗しました';
    const payload: SearchErrorBody = { ok: false, message };
    const status = message.includes('必須') || message.includes('不正') ? 400 : 500;
    return NextResponse.json(payload satisfies SearchErrorBody, { status });
  }
}

async function saveHistoryAsync(searchRequest: SearchRequest, videos: VideoResult[]) {
  const workerUrl = process.env.WORKER_URL;
  if (!workerUrl) {
    console.warn('WORKER_URL is not configured. Skipping history save.');
    return;
  }

  const payload: SaveHistoryRequest = {
    searchRequest,
    videos,
  };

  const response = await fetch(`${workerUrl}/api/history/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Worker responded with ${response.status}`);
  }
}
