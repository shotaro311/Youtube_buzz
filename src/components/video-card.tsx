import type { VideoResult } from '@/lib/types';
import { SaveButton } from './save-button';
import { formatDateTimeJst } from '@/lib/date';

interface VideoCardProps {
  video: VideoResult;
  keyword: string;
  isSaved: boolean;
  onSaved: (videoId: string) => void;
}

export function VideoCard({ video, keyword, isSaved, onSaved }: VideoCardProps) {
  const addedAtDisplay = formatDateTimeJst(new Date());
  const publishedAtDisplay = formatDateTimeJst(video.publishedAt);
  const channelPublishedAtDisplay = video.channelPublishedAt
    ? formatDateTimeJst(video.channelPublishedAt)
    : '';

  const payload = {
    addedAt: addedAtDisplay,
    keyword,
    title: video.title,
    videoUrl: video.videoUrl,
    channelName: video.channelName,
    channelUrl: video.channelUrl,
    views: video.views,
    subscribers: video.subscribers,
    publishedAt: publishedAtDisplay,
    growthScore: video.growthScore,
    channelPublishedAt: channelPublishedAtDisplay,
    memo: '',
  } as const;

  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <header className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-sky-600">伸び率スコア {video.growthScore.toFixed(2)}</span>
        <a
          href={video.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-semibold leading-tight text-zinc-900 hover:underline"
        >
          {video.title}
        </a>
        <div className="text-sm text-zinc-500">
          <a
            href={video.channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-zinc-700 hover:underline"
          >
            {video.channelName}
          </a>{' '}
          / {publishedAtDisplay}
        </div>
      </header>
      <dl className="grid grid-cols-2 gap-3 text-sm text-zinc-600">
        <div>
          <dt className="text-xs uppercase text-zinc-400">再生数</dt>
          <dd className="font-semibold text-zinc-700">{video.views.toLocaleString()} 回</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-zinc-400">登録者数</dt>
          <dd className="font-semibold text-zinc-700">{video.subscribers.toLocaleString()} 人</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-zinc-400">チャンネル開始</dt>
          <dd>{channelPublishedAtDisplay || '不明'}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs uppercase text-zinc-400">投稿日</dt>
          <dd className="font-semibold text-zinc-700">{publishedAtDisplay}</dd>
        </div>
      </dl>
      <SaveButton videoId={video.videoId} payload={payload} disabled={isSaved} onSaved={onSaved} />
    </article>
  );
}
