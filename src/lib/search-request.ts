import type { SearchRequest } from './types';

export const defaultSearchRequest: SearchRequest = {
  keyword: '',
  region: 'jp',
  minSubscribers: 100,
  minViews: 10_000,
  publishedWithin: '30',
  videoDuration: 'any',
  excludeKeywords: '',
  includeShorts: true,
  maxSubscribers: null,
  maxViews: null,
};

export function normalizeSearchRequest(
  input?: Partial<SearchRequest> | null
): SearchRequest {
  const merged = { ...defaultSearchRequest, ...(input ?? {}) };

  return {
    keyword: merged.keyword ?? defaultSearchRequest.keyword,
    region: merged.region ?? defaultSearchRequest.region,
    minSubscribers:
      merged.minSubscribers ?? defaultSearchRequest.minSubscribers,
    minViews: merged.minViews ?? defaultSearchRequest.minViews,
    publishedWithin:
      merged.publishedWithin ?? defaultSearchRequest.publishedWithin,
    videoDuration:
      merged.videoDuration ?? defaultSearchRequest.videoDuration,
    excludeKeywords:
      merged.excludeKeywords ?? defaultSearchRequest.excludeKeywords,
    includeShorts:
      merged.includeShorts ?? defaultSearchRequest.includeShorts,
    maxSubscribers:
      merged.maxSubscribers === undefined ? null : merged.maxSubscribers,
    maxViews: merged.maxViews === undefined ? null : merged.maxViews,
  };
}
