import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  return NextResponse.json(
    {
      ok: false,
      message: '保存 API は未実装です。GAS エンドポイントへの連携処理を追加してください。',
      received: body,
    },
    { status: 501 },
  );
}
