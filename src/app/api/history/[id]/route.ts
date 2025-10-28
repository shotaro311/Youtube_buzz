import { NextResponse } from 'next/server';

interface Params {
  params: { id: string };
}

interface DeleteResponseBody {
  ok: boolean;
  message?: string;
}

export async function DELETE(_request: Request, { params }: Params) {
  const workerUrl = process.env.WORKER_URL;
  if (!workerUrl) {
    return NextResponse.json(
      { ok: false, message: 'WORKER_URL が未設定です' } satisfies DeleteResponseBody,
      { status: 500 }
    );
  }

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json(
      { ok: false, message: '履歴IDが不正です' } satisfies DeleteResponseBody,
      { status: 400 }
    );
  }

  const response = await fetch(`${workerUrl}/api/history/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const text = await response.text();
    return NextResponse.json(
      { ok: false, message: text || '履歴の削除に失敗しました' } satisfies DeleteResponseBody,
      { status: response.status }
    );
  }

  return NextResponse.json({ ok: true } satisfies DeleteResponseBody);
}
