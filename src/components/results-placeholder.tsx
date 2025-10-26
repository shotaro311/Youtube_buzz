export function ResultsPlaceholder({ keyword }: { keyword?: string }) {
  if (!keyword) {
    return (
      <div className="rounded-3xl border border-dashed border-zinc-300 bg-white/70 p-6 text-sm text-zinc-600">
        条件を入力して「バズ動画を検索」を押すと、伸び率順の候補がここに表示されます。
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-sky-200 bg-sky-50 p-6 text-sm text-sky-800">
      <p className="font-semibold">`{keyword}` の結果は準備中です。</p>
      <p className="mt-2 leading-6">
        API と保存処理の実装後に、再生数・登録者数・伸び率スコア付きで 30 件まで一覧表示されます。
        現段階ではモックデータを返すように API を整備してください。
      </p>
    </div>
  );
}
