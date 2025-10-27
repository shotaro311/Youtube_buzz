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
            <span className="rounded-full bg-sky-50 px-3 py-1">検索履歴を自動保存</span>
            <span className="rounded-full bg-sky-50 px-3 py-1">GAS 連携で保存</span>
          </div>
        </header>

        <section>
          <SearchShell />
        </section>
      </main>
    </div>
  );
}
