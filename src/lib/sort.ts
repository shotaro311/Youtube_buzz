import type { VideoResult } from './types';

export type SortKey = 'growth' | 'publishedAt' | 'views' | 'subscribers' | 'channelPublishedAt';

export function sortVideos(videos: VideoResult[], key: SortKey): VideoResult[] {
  const clone = [...videos];
  const compareDate = (value: string) => new Date(value).getTime() || 0;

  clone.sort((a, b) => {
    switch (key) {
      case 'growth':
        return b.growthScore - a.growthScore;
      case 'publishedAt':
        return compareDate(b.publishedAt) - compareDate(a.publishedAt);
      case 'views':
        return b.views - a.views;
      case 'subscribers':
        return b.subscribers - a.subscribers;
      case 'channelPublishedAt':
        return compareDate(b.channelPublishedAt) - compareDate(a.channelPublishedAt);
      default:
        return 0;
    }
  });

  return clone;
}
