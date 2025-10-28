import type { Region, SearchRequest, VideoDuration, VideoResult } from './types';
import { getPublishedAfterFilter } from './date';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';
const API_KEYS = (process.env.YOUTUBE_API_KEYS ?? '')
  .split(',')
  .map(key => key.trim())
  .filter(Boolean);
let apiKeyCursor = 0;

interface SearchItem {
  id: { videoId?: string };
}

interface VideoItem {
  id: string;
  snippet: {
    channelId: string;
    channelTitle: string;
    publishedAt: string;
    title: string;
    defaultLanguage?: string;
    defaultAudioLanguage?: string;
    tags?: string[];
    description?: string;
    thumbnails?: {
      default?: { url?: string };
      medium?: { url?: string };
      high?: { url?: string };
      standard?: { url?: string };
      maxres?: { url?: string };
    };
  };
  statistics?: {
    viewCount?: string;
  };
  contentDetails?: {
    duration?: string;
  };
}

interface ChannelItem {
  id: string;
  snippet: {
    title: string;
    publishedAt: string;
    country?: string;
  };
  statistics?: {
    subscriberCount?: string;
  };
}

interface SearchApiResponse {
  items?: SearchItem[];
  nextPageToken?: string;
}

interface VideosApiResponse {
  items?: VideoItem[];
}

interface ChannelsApiResponse {
  items?: ChannelItem[];
}

const MAX_RESULTS = 30;
const SEARCH_PAGE_SIZE = 50;
const SEARCH_TARGET_RESULTS = 1000;
const SEARCH_MAX_PAGES = Math.ceil(SEARCH_TARGET_RESULTS / SEARCH_PAGE_SIZE); // 最大 ~1000件

export async function fetchVideos(request: SearchRequest): Promise<VideoResult[]> {
  if (API_KEYS.length === 0) {
    throw new Error('YOUTUBE_API_KEYS is not configured');
  }

  let lastQuotaError: Error | null = null;

  for (let offset = 0; offset < API_KEYS.length; offset++) {
    const apiKey = API_KEYS[(apiKeyCursor + offset) % API_KEYS.length];
    try {
      const results = await fetchWithKey(request, apiKey);
      apiKeyCursor = (apiKeyCursor + offset + 1) % API_KEYS.length;
      return results;
    } catch (error) {
      if (isQuotaError(error)) {
        lastQuotaError = error as Error;
        continue;
      }
      throw error;
    }
  }

  throw lastQuotaError ?? new Error('YouTube API quota exhausted for all keys');
}

async function fetchWithKey(request: SearchRequest, apiKey: string): Promise<VideoResult[]> {
  const searchItems = await fetchSearchItems(request, apiKey);
  if (searchItems.length === 0) {
    return [];
  }

  const videoIds = Array.from(
    new Set(searchItems.map(item => item.id.videoId).filter((id): id is string => Boolean(id)))
  );
  if (videoIds.length === 0) {
    return [];
  }

  const videos = await fetchVideosByIds(videoIds, apiKey);
  const channelIds = Array.from(new Set(videos.map(video => video.snippet.channelId)));
  const channels = await fetchChannelsByIds(channelIds, apiKey);
  const channelMap = new Map(channels.map(channel => [channel.id, channel] as const));

  const parseCount = (value?: string) => {
    const parsed = Number(value ?? '0');
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const results: VideoResult[] = [];
  const excludeTerms = request.excludeKeywords
    .split(',')
    .map(term => term.trim().toLowerCase())
    .filter(Boolean);

  for (const video of videos) {
    const channel = channelMap.get(video.snippet.channelId);
    const views = parseCount(video.statistics?.viewCount);
    const subscribers = parseCount(channel?.statistics?.subscriberCount);
    const durationSeconds = parseDurationSeconds(video.contentDetails?.duration);
    const thumbnailUrl =
      video.snippet.thumbnails?.maxres?.url ??
      video.snippet.thumbnails?.high?.url ??
      video.snippet.thumbnails?.standard?.url ??
      video.snippet.thumbnails?.medium?.url ??
      video.snippet.thumbnails?.default?.url ??
      '';

    if (views < request.minViews) continue;
    if (subscribers < request.minSubscribers) continue;

    if (excludeTerms.length > 0) {
      const titleLower = video.snippet.title.toLowerCase();
      const descriptionLower = video.snippet.description?.toLowerCase() ?? '';
      const channelTitleLower = channel?.snippet.title.toLowerCase() ?? '';
      const hasExcluded = excludeTerms.some(term =>
        titleLower.includes(term) || descriptionLower.includes(term) || channelTitleLower.includes(term)
      );
      if (hasExcluded) {
        continue;
      }
    }

    const isShort = durationSeconds !== null && durationSeconds <= 60;
    if (!matchesDuration(durationSeconds, request.videoDuration)) {
      continue;
    }
    if (!request.includeShorts) {
      const tags = video.snippet.tags?.map(tag => tag.toLowerCase()) ?? [];
      const titleLower = video.snippet.title.toLowerCase();
      const descriptionLower = video.snippet.description?.toLowerCase() ?? '';
      const hasShortsTag = tags.some(tag => tag === '#shorts' || tag === 'shorts');
      const hasShortsText = titleLower.includes('#shorts') || descriptionLower.includes('#shorts');
      if (isShort || hasShortsTag || hasShortsText) {
        continue;
      }
    }

    if (request.maxSubscribers !== null && subscribers > request.maxSubscribers) continue;
    if (request.maxViews !== null && views > request.maxViews) continue;

    if (request.region === 'jp') {
      const channelCountry = channel?.snippet.country;
      const videoLanguage = video.snippet.defaultAudioLanguage ?? video.snippet.defaultLanguage ?? '';
      const isJapaneseChannel = channelCountry === 'JP';
      const isJapaneseLanguage = videoLanguage.toLowerCase().startsWith('ja');
      if (!isJapaneseChannel && !isJapaneseLanguage) {
        continue;
      }
    }

    const growthScore = subscribers > 0 ? views / subscribers : views;

    results.push({
      videoId: video.id,
      title: video.snippet.title,
      videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
      channelId: video.snippet.channelId,
      channelName: channel?.snippet.title ?? video.snippet.channelId,
      channelUrl: `https://www.youtube.com/channel/${video.snippet.channelId}`,
      views,
      subscribers,
      publishedAt: video.snippet.publishedAt,
      channelPublishedAt: channel?.snippet.publishedAt ?? '',
      growthScore,
      thumbnailUrl,
      isShort,
    });
  }

  results.sort((a, b) => b.growthScore - a.growthScore);
  return results.slice(0, MAX_RESULTS);
}

async function fetchSearchItems(request: SearchRequest, apiKey: string): Promise<SearchItem[]> {
  const seen = new Set<string>();
  const collected: SearchItem[] = [];
  let pageToken: string | undefined;

  for (let page = 0; page < SEARCH_MAX_PAGES; page++) {
    const params = new URLSearchParams({
      key: apiKey,
      part: 'id',
      type: 'video',
      maxResults: String(SEARCH_PAGE_SIZE),
      q: request.keyword,
      order: 'date',
    });

    if (pageToken) {
      params.set('pageToken', pageToken);
    }

    applyRegionParams(params, request.region);
    const publishedAfter = getPublishedAfterFilter(request.publishedWithin);
    if (publishedAfter) {
      params.set('publishedAfter', publishedAfter);
    }
    let query = request.keyword;
    const excludeTerms = request.excludeKeywords
      .split(',')
      .map(term => term.trim())
      .filter(Boolean);
    if (excludeTerms.length > 0) {
      const minusPart = excludeTerms.map(term => `-${term}`).join(' ');
      query = `${query} ${minusPart}`.trim();
    }
    params.set('q', query);

    if (request.videoDuration !== 'any') {
      params.set('videoDuration', request.videoDuration);
    }

    let response: SearchApiResponse;
    try {
      response = await fetchJson<SearchApiResponse>(`${BASE_URL}/search?${params.toString()}`);
    } catch (error) {
      if (collected.length > 0 && isQuotaError(error)) {
        break;
      }
      throw error;
    }
    const items = response.items?.filter(item => item.id.videoId) ?? [];

    for (const item of items) {
      const videoId = item.id.videoId!;
      if (seen.has(videoId)) continue;
      seen.add(videoId);
      collected.push(item);
    }

    if (!response.nextPageToken || seen.size >= SEARCH_TARGET_RESULTS) {
      break;
    }

    pageToken = response.nextPageToken;
  }

  return collected;
}

async function fetchVideosByIds(ids: string[], apiKey: string): Promise<VideoItem[]> {
  const chunks = chunk(ids, 50);
  const results: VideoItem[] = [];

  for (const chunkIds of chunks) {
    const params = new URLSearchParams({
      key: apiKey,
      part: 'snippet,statistics,contentDetails',
      id: chunkIds.join(','),
      maxResults: String(chunkIds.length),
    });

    try {
      const response = await fetchJson<VideosApiResponse>(`${BASE_URL}/videos?${params.toString()}`);
      if (response.items) {
        results.push(...response.items);
      }
    } catch (error) {
      if (results.length > 0 && isQuotaError(error)) {
        break;
      }
      throw error;
    }
  }

  return results;
}

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

function parseDurationSeconds(duration?: string): number | null {
  if (!duration) return null;
  const match = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(duration);
  if (!match) return null;
  const [, hours, minutes, seconds] = match;
  const total =
    (hours ? Number(hours) * 3600 : 0) +
    (minutes ? Number(minutes) * 60 : 0) +
    (seconds ? Number(seconds) : 0);
  return Number.isFinite(total) ? total : null;
}

function matchesDuration(durationSeconds: number | null, filter: VideoDuration): boolean {
  if (filter === 'any') return true;
  if (durationSeconds === null) return false;
  if (filter === 'short') {
    return durationSeconds < 4 * 60;
  }
  if (filter === 'medium') {
    return durationSeconds >= 4 * 60 && durationSeconds <= 20 * 60;
  }
  return durationSeconds > 20 * 60;
}

async function fetchChannelsByIds(channelIds: string[], apiKey: string): Promise<ChannelItem[]> {
  if (channelIds.length === 0) {
    return [];
  }

  const chunks = chunk(channelIds, 50);
  const results: ChannelItem[] = [];

  for (const chunkIds of chunks) {
    const params = new URLSearchParams({
      key: apiKey,
      part: 'snippet,statistics',
      id: chunkIds.join(','),
      maxResults: String(chunkIds.length),
    });

    try {
      const response = await fetchJson<ChannelsApiResponse>(`${BASE_URL}/channels?${params.toString()}`);
      if (response.items) {
        results.push(...response.items);
      }
    } catch (error) {
      if (results.length > 0 && isQuotaError(error)) {
        break;
      }
      throw error;
    }
  }

  return results;
}

function applyRegionParams(params: URLSearchParams, region: Region) {
  if (region === 'jp') {
    params.set('regionCode', 'JP');
    params.set('relevanceLanguage', 'ja');
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`YouTube API error: ${response.status} ${text}`);
  }
  return response.json() as Promise<T>;
}

function isQuotaError(error: unknown): boolean {
  return error instanceof Error && /quota/i.test(error.message);
}
