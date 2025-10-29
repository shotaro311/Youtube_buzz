import { NextRequest, NextResponse } from 'next/server';
import type { DeleteHistoryResponseBody } from '@/lib/types';

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const workerUrl = process.env.WORKER_URL;
  if (!workerUrl) {
    return NextResponse.json(
      { ok: false, message: 'WORKER_URL が未設定です' } satisfies DeleteHistoryResponseBody,
      { status: 500 }
    );
  }

  const params = await Promise.resolve(context.params);
  const id = Number.parseInt(params?.id ?? '', 10);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json(
      { ok: false, message: '履歴IDが不正です' } satisfies DeleteHistoryResponseBody,
      { status: 400 }
    );
  }

  const response = await fetch(`${workerUrl}/api/history/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  const responseText = await response.text();

  let data: DeleteHistoryResponseBody | null = null;
  if (responseText) {
    try {
      data = JSON.parse(responseText) as DeleteHistoryResponseBody;
    } catch (error) {
      console.error('[api/history/[id]] Worker JSON parse error:', error);
    }
  }

  if (!response.ok || !data || data.ok !== true) {
    const message =
      data && 'message' in data && data.message
        ? data.message
        : responseText || '履歴の削除に失敗しました';
    return NextResponse.json(
      { ok: false, message } satisfies DeleteHistoryResponseBody,
      { status: response.ok ? 500 : response.status }
    );
  }

  return NextResponse.json({ ok: true } satisfies DeleteHistoryResponseBody);
}
