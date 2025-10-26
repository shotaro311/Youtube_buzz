import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  return NextResponse.json(
    {
      ok: false,
      message: '検索 API は未実装です。YouTube Data API と D1 キャッシュを接続してください。',
      received: body,
    },
    { status: 501 },
  );
}
