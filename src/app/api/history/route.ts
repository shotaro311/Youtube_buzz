import { NextResponse } from 'next/server';
import type { HistoryResponseBody } from '@/lib/types';

export async function GET() {
  try {
    const workerUrl = process.env.WORKER_URL;
    if (!workerUrl) {
      return NextResponse.json(
        { ok: false, message: 'WORKER_URL が未設定です' } satisfies HistoryResponseBody,
        { status: 500 }
      );
    }

    const response = await fetch(`${workerUrl}/api/history`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Worker responded with ${response.status}`);
    }

    const data = await response.json() as HistoryResponseBody;
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : '履歴の取得に失敗しました';
    return NextResponse.json(
      { ok: false, message } satisfies HistoryResponseBody,
      { status: 500 }
    );
  }
}
