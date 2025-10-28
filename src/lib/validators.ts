import type { PublishedWithin, Region, SearchRequest, VideoDuration, VideoResult } from './types';

const REGION_VALUES: Region[] = ['jp', 'global'];
const PUBLISHED_WITHIN_VALUES: PublishedWithin[] = ['any', '7', '30', '90', '180'];
const VIDEO_DURATION_VALUES: VideoDuration[] = ['any', 'short', 'medium', 'long'];

export function parseSearchRequest(input: unknown): SearchRequest {
  if (!input || typeof input !== 'object') {
    throw new Error('Invalid request body');
  }

  const data = input as Record<string, unknown>;
  const keyword = (data.keyword as string | undefined)?.trim();
  const region = data.region as Region | undefined;
  const minSubscribers = Number(data.minSubscribers ?? 0);
  const minViews = Number(data.minViews ?? 0);
  const publishedWithin = data.publishedWithin as PublishedWithin | undefined;
  const includeShortsValue = data.includeShorts ?? true;
  const maxSubscribersValue = data.maxSubscribers;
  const maxViewsValue = data.maxViews;
  const videoDurationValue = (data.videoDuration as VideoDuration | undefined) ?? 'any';

  if (!keyword) {
    throw new Error('検索キーワードは必須です');
  }
  if (!region || !REGION_VALUES.includes(region)) {
    throw new Error('region の値が不正です');
  }
  if (!publishedWithin || !PUBLISHED_WITHIN_VALUES.includes(publishedWithin)) {
    throw new Error('publishedWithin の値が不正です');
  }
  if (!VIDEO_DURATION_VALUES.includes(videoDurationValue)) {
    throw new Error('videoDuration の値が不正です');
  }
  if (!Number.isFinite(minSubscribers) || minSubscribers < 0) {
    throw new Error('minSubscribers の値が不正です');
  }
  if (!Number.isFinite(minViews) || minViews < 0) {
    throw new Error('minViews の値が不正です');
  }

  const includeShorts =
    typeof includeShortsValue === 'boolean'
      ? includeShortsValue
      : String(includeShortsValue).toLowerCase() !== 'false';

  const maxSubscribers = parseOptionalNumber(maxSubscribersValue);
  const maxViews = parseOptionalNumber(maxViewsValue);

  if (maxSubscribers !== null && maxSubscribers < minSubscribers) {
    throw new Error('maxSubscribers は minSubscribers 以上である必要があります');
  }
  if (maxViews !== null && maxViews < minViews) {
    throw new Error('maxViews は minViews 以上である必要があります');
  }

  return {
    keyword,
    region,
    minSubscribers,
    minViews,
    publishedWithin,
    videoDuration: videoDurationValue,
    includeShorts,
    maxSubscribers,
    maxViews,
  };
}

export function sanitizeVideoResult(result: VideoResult) {
  return {
    ...result,
    growthScore: Number(result.growthScore.toFixed(2)),
  };
}

function parseOptionalNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error('数値の形式が不正です');
  }
  return parsed;
}
