export type Region = 'jp' | 'global';

export type PublishedWithin = 'any' | '7' | '30' | '90' | '180';

export interface SearchRequest {
  keyword: string;
  region: Region;
  minSubscribers: number;
  minViews: number;
  publishedWithin: PublishedWithin;
  includeShorts: boolean;
  maxSubscribers: number | null;
  maxViews: number | null;
}

export interface VideoResult {
  videoId: string;
  title: string;
  videoUrl: string;
  channelId: string;
  channelName: string;
  channelUrl: string;
  views: number;
  subscribers: number;
  publishedAt: string;
  channelPublishedAt: string;
  growthScore: number;
  isShort: boolean;
}

export interface SearchResponseBody {
  ok: true;
  videos: VideoResult[];
}

export interface SearchErrorBody {
  ok: false;
  message: string;
}

export interface SaveRequestBody {
  addedAt: string;
  keyword: string;
  title: string;
  videoUrl: string;
  channelName: string;
  channelUrl: string;
  views: number;
  subscribers: number;
  publishedAt: string;
  growthScore: number;
  channelPublishedAt: string;
  memo: string;
}

export type SaveResponseBody =
  | { ok: true }
  | { ok: false; message: string };
