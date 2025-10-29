import type { SearchRequest, VideoResult } from '../types';
import { normalizeSearchRequest } from '../search-request';

export interface SavedResultSet {
  id: string;
  keyword: string;
  createdAt: string;
  searchRequest: SearchRequest;
  videos: VideoResult[];
}

export const SAVED_RESULTS_STORAGE_KEY = 'youtube-buzz-search-results';
export const SAVED_RESULTS_MAX_ITEMS = 10;
const STORAGE_VERSION = 1;

interface PersistedPayload {
  version: number;
  items: SavedResultSet[];
}

function isPersistedPayload(value: unknown): value is PersistedPayload {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const payload = value as Record<string, unknown>;
  return (
    typeof payload.version === 'number' &&
    Array.isArray(payload.items)
  );
}

export function loadSavedResults(): SavedResultSet[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = window.localStorage.getItem(SAVED_RESULTS_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    const items = isPersistedPayload(parsed)
      ? parsed.items
      : Array.isArray(parsed)
        ? (parsed as SavedResultSet[])
        : [];

    return items.map(item => ({
      ...item,
      searchRequest: normalizeSearchRequest(item.searchRequest),
      videos: Array.isArray(item.videos) ? item.videos : [],
    }));
  } catch (error) {
    console.error('[saved-results] Failed to parse saved results:', error);
    return [];
  }
}

export function persistSavedResults(items: SavedResultSet[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  const payload: PersistedPayload = {
    version: STORAGE_VERSION,
    items: items.slice(0, SAVED_RESULTS_MAX_ITEMS),
  };

  window.localStorage.setItem(
    SAVED_RESULTS_STORAGE_KEY,
    JSON.stringify(payload)
  );
}
