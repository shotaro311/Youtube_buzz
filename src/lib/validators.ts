import type { PublishedWithin, Region, SearchRequest, ExcludableDuration, VideoResult } from './types';

const REGION_VALUES: Region[] = ['jp', 'global'];
const PUBLISHED_WITHIN_VALUES: PublishedWithin[] = ['any', '7', '30', '90', '180'];
const EXCLUDABLE_DURATION_VALUES: ExcludableDuration[] = ['short', 'medium', 'long'];

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
  const maxSubscribersValue = data.maxSubscribers;
  const maxViewsValue = data.maxViews;
  const excludeKeywordsValue = (data.excludeKeywords as string | undefined)?.trim() ?? '';
  const excludeDurationsValue = data.excludeDurations as unknown;

  if (!keyword) {
    throw new Error('検索キーワードは必須です');
  }
  if (!region || !REGION_VALUES.includes(region)) {
    throw new Error('region の値が不正です');
  }
  if (!publishedWithin || !PUBLISHED_WITHIN_VALUES.includes(publishedWithin)) {
    throw new Error('publishedWithin の値が不正です');
  }
  if (!Number.isFinite(minSubscribers) || minSubscribers < 0) {
    throw new Error('minSubscribers の値が不正です');
  }
  if (!Number.isFinite(minViews) || minViews < 0) {
    throw new Error('minViews の値が不正です');
  }

  // Parse and validate excludeDurations
  const excludeDurations: ExcludableDuration[] = [];
  if (Array.isArray(excludeDurationsValue)) {
    for (const duration of excludeDurationsValue) {
      if (typeof duration === 'string' && EXCLUDABLE_DURATION_VALUES.includes(duration as ExcludableDuration)) {
        excludeDurations.push(duration as ExcludableDuration);
      }
    }
  }

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
    excludeKeywords: excludeKeywordsValue,
    excludeDurations,
    maxSubscribers,
    maxViews,
  };
}

export function sanitizeVideoResult(result: VideoResult) {
  return {
    ...result,
    growthScore: Number(result.growthScore.toFixed(2)),
    thumbnailUrl: result.thumbnailUrl,
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
