import { SearchShell } from "@/components/search-shell";

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-sky-50 via-white to-white">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 pb-16 pt-12 sm:px-10 lg:px-16">
        <header className="flex flex-col gap-4 rounded-3xl bg-white/80 p-8 shadow-sm ring-1 ring-sky-100 backdrop-blur">
          <span className="w-fit rounded-full bg-sky-100 px-4 py-1 text-xs font-semibold text-sky-700">
            YouTube バズリサーチ
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            バズの芽を最速で掴むためのリサーチハブ
          </h1>
          <p className="max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
            キーワードと絞り込み条件を入力すると、登録者数に対する伸び率が高い動画を抽出します。
            保存ボタンから Google スプレッドシートへ共有するワークフローを前提に設計されています。
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-sky-700">
            <span className="rounded-full bg-sky-50 px-3 py-1">伸び率スコアで自動ソート</span>
            <span className="rounded-full bg-sky-50 px-3 py-1">Cloudflare D1 キャッシュ</span>
            <span className="rounded-full bg-sky-50 px-3 py-1">GAS 連携で保存</span>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <SearchShell />
          </div>
          <aside className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">開発メモ</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-zinc-600">
              <li>YouTube Data API v3 の毎時キャッシュは Cloudflare D1 を利用します。</li>
              <li>保存 API は Google Apps Script エンドポイントに JSON を POST します。</li>
              <li>詳細な要件は docs/ フォルダのドキュメントを参照してください。</li>
            </ul>
            <div className="rounded-2xl bg-zinc-50 p-4 text-xs text-zinc-500">
              開発フェーズ 1: ローカル動作を優先し、モックレスポンスで UI 挙動を固めたのち API を接続します。
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
