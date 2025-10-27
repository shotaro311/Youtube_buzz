import type { VideoResult } from '@/lib/types';
import { VideoCard } from './video-card';

interface ResultsGridProps {
  keyword: string;
  videos: VideoResult[];
  saved: Set<string>;
  onSaved: (videoId: string) => void;
}

export function ResultsGrid({ keyword, videos, saved, onSaved }: ResultsGridProps) {
  if (videos.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-zinc-300 bg-white/70 p-6 text-sm text-zinc-600">
        該当する結果が見つかりませんでした。
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {videos.map(video => (
        <VideoCard
          key={video.videoId}
          video={video}
          keyword={keyword}
          isSaved={saved.has(video.videoId)}
          onSaved={onSaved}
        />
      ))}
    </div>
  );
}
