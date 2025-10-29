'use client';

import { useCallback, useEffect, useMemo, useReducer } from 'react';
import type {
  SearchRequest,
  SearchResponseBody,
  VideoResult,
} from '../types';
import {
  defaultSearchRequest,
  normalizeSearchRequest,
} from '../search-request';
import { sortVideos, type SortKey } from '../sort';
import {
  loadSavedResults,
  persistSavedResults,
  SAVED_RESULTS_MAX_ITEMS,
  type SavedResultSet,
} from '../storage/saved-results';

type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

interface Notice {
  type: 'success' | 'error' | 'info';
  message: string;
}

interface SearchExperienceState {
  form: SearchRequest;
  status: SearchStatus;
  keyword: string;
  request: SearchRequest | null;
  videos: VideoResult[];
  error: string | null;
  sortKey: SortKey;
  currentSavedIds: Set<string>;
  savedResults: SavedResultSet[];
  modalItem: SavedResultSet | null;
  notice: Notice | null;
}

type Action =
  | { type: 'FORM_PATCH'; payload: Partial<SearchRequest> }
  | { type: 'SEARCH_START'; payload: SearchRequest }
  | {
      type: 'SEARCH_SUCCESS';
      payload: { request: SearchRequest; videos: VideoResult[] };
    }
  | { type: 'SEARCH_FAILURE'; payload: string }
  | { type: 'SET_SORT_KEY'; payload: SortKey }
  | { type: 'CURRENT_SAVED_ADD'; payload: string }
  | { type: 'SAVED_RESULTS_LOAD'; payload: SavedResultSet[] }
  | { type: 'SAVED_RESULTS_SET'; payload: SavedResultSet[] }
  | { type: 'VIEW_SAVED'; payload: SavedResultSet | null }
  | { type: 'SHOW_NOTICE'; payload: Notice }
  | { type: 'CLEAR_NOTICE' };

const createInitialState = (): SearchExperienceState => ({
  form: { ...defaultSearchRequest },
  status: 'idle',
  keyword: '',
  request: null,
  videos: [],
  error: null,
  sortKey: 'growth',
  currentSavedIds: new Set<string>(),
  savedResults: [],
  modalItem: null,
  notice: null,
});

const reducer = (
  state: SearchExperienceState,
  action: Action
): SearchExperienceState => {
  switch (action.type) {
    case 'FORM_PATCH': {
      const nextForm = normalizeSearchRequest({
        ...state.form,
        ...action.payload,
      });
      return { ...state, form: nextForm };
    }
    case 'SEARCH_START': {
      return {
        ...state,
        status: 'loading',
        error: null,
        request: action.payload,
        keyword: action.payload.keyword,
        currentSavedIds: new Set<string>(),
        notice: null,
      };
    }
    case 'SEARCH_SUCCESS': {
      return {
        ...state,
        status: 'success',
        request: action.payload.request,
        keyword: action.payload.request.keyword,
        videos: action.payload.videos,
        error: null,
        currentSavedIds: new Set<string>(),
      };
    }
    case 'SEARCH_FAILURE': {
      return {
        ...state,
        status: 'error',
        videos: [],
        error: action.payload,
      };
    }
    case 'SET_SORT_KEY': {
      return { ...state, sortKey: action.payload };
    }
    case 'CURRENT_SAVED_ADD': {
      const next = new Set(state.currentSavedIds);
      next.add(action.payload);
      return { ...state, currentSavedIds: next };
    }
    case 'SAVED_RESULTS_LOAD':
    case 'SAVED_RESULTS_SET': {
      return { ...state, savedResults: action.payload };
    }
    case 'VIEW_SAVED': {
      return { ...state, modalItem: action.payload };
    }
    case 'SHOW_NOTICE': {
      return { ...state, notice: action.payload };
    }
    case 'CLEAR_NOTICE': {
      return { ...state, notice: null };
    }
    default:
      return state;
  }
};

export function useSearchExperience() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  useEffect(() => {
    const items = loadSavedResults();
    if (items.length > 0) {
      dispatch({ type: 'SAVED_RESULTS_LOAD', payload: items });
    }
  }, []);

  useEffect(() => {
    persistSavedResults(state.savedResults);
  }, [state.savedResults]);

  const updateForm = useCallback(
    (partial: Partial<SearchRequest>) => {
      dispatch({ type: 'FORM_PATCH', payload: partial });
    },
    [dispatch]
  );

  const setSortKey = useCallback(
    (next: SortKey) => {
      dispatch({ type: 'SET_SORT_KEY', payload: next });
    },
    [dispatch]
  );

  const submitSearch = useCallback(async () => {
    const normalized = normalizeSearchRequest(state.form);
    dispatch({ type: 'FORM_PATCH', payload: normalized });
    dispatch({ type: 'SEARCH_START', payload: normalized });

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(normalized),
      });
      const json = await response
        .json()
        .catch(() => null) as
        | SearchResponseBody
        | { ok: false; message: string }
        | null;

      if (!response.ok || !json) {
        throw new Error('検索に失敗しました');
      }

      if (json.ok !== true) {
        throw new Error(json.message);
      }

      dispatch({
        type: 'SEARCH_SUCCESS',
        payload: { request: normalized, videos: json.videos },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '検索に失敗しました';
      dispatch({ type: 'SEARCH_FAILURE', payload: message });
      dispatch({
        type: 'SHOW_NOTICE',
        payload: { type: 'error', message },
      });
    }
  }, [state.form]);

  const markVideoSaved = useCallback(
    (videoId: string) => {
      dispatch({ type: 'CURRENT_SAVED_ADD', payload: videoId });
    },
    [dispatch]
  );

  const saveCurrentResults = useCallback(() => {
    if (state.status !== 'success' || state.videos.length === 0) {
      dispatch({
        type: 'SHOW_NOTICE',
        payload: {
          type: 'info',
          message: '保存できる検索結果がありません',
        },
      });
      return;
    }

    const request = state.request ?? state.form;
    const videos = sortVideos(state.videos, state.sortKey);
    const entry: SavedResultSet = {
      id:
        typeof globalThis.crypto !== 'undefined' &&
        typeof globalThis.crypto.randomUUID === 'function'
          ? globalThis.crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`,
      keyword: state.keyword,
      createdAt: new Date().toISOString(),
      searchRequest: normalizeSearchRequest(request),
      videos,
    };

    const next = [entry, ...state.savedResults].slice(
      0,
      SAVED_RESULTS_MAX_ITEMS
    );
    dispatch({ type: 'SAVED_RESULTS_SET', payload: next });
    dispatch({
      type: 'SHOW_NOTICE',
      payload: { type: 'success', message: '検索結果を保存しました' },
    });
  }, [
    state.status,
    state.videos,
    state.sortKey,
    state.savedResults,
    state.request,
    state.form,
    state.keyword,
  ]);

  const deleteSavedResult = useCallback(
    (id: string) => {
      const next = state.savedResults.filter(item => item.id !== id);
      dispatch({ type: 'SAVED_RESULTS_SET', payload: next });
      dispatch({
        type: 'SHOW_NOTICE',
        payload: { type: 'success', message: '保存データを削除しました' },
      });
    },
    [state.savedResults]
  );

  const openSavedModal = useCallback(
    (item: SavedResultSet) => {
      dispatch({ type: 'VIEW_SAVED', payload: item });
    },
    [dispatch]
  );

  const closeSavedModal = useCallback(() => {
    dispatch({ type: 'VIEW_SAVED', payload: null });
  }, [dispatch]);

  const dismissNotice = useCallback(() => {
    dispatch({ type: 'CLEAR_NOTICE' });
  }, [dispatch]);

  const sortedVideos = useMemo(() => {
    if (state.status !== 'success') {
      return [] as VideoResult[];
    }
    return sortVideos(state.videos, state.sortKey);
  }, [state.status, state.videos, state.sortKey]);

  return {
    form: state.form,
    updateForm,
    submitSearch,
    status: state.status,
    error: state.error,
    keyword: state.keyword,
    request: state.request,
    videos: state.videos,
    sortedVideos,
    sortKey: state.sortKey,
    setSortKey,
    currentSavedIds: state.currentSavedIds,
    markVideoSaved,
    saveCurrentResults,
    savedResults: state.savedResults,
    deleteSavedResult,
    openSavedModal,
    closeSavedModal,
    modalItem: state.modalItem,
    notice: state.notice,
    dismissNotice,
  };
}
