import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import type { SearchHistory } from '@/lib/types';
import { SearchHistoryComponent } from './search-history';

const createHistoryItem = (overrides: Partial<SearchHistory> = {}): SearchHistory => ({
  id: 1,
  keyword: 'テストキーワード',
  region: 'jp',
  minSubscribers: 0,
  maxSubscribers: null,
  minViews: 0,
  maxViews: null,
  publishedWithin: 'any',
  videoDuration: 'any',
  excludeKeywords: '',
  includeShorts: false,
  resultCount: 5,
  searchedAt: '2025-10-27T12:00:00.000Z',
  ...overrides,
});

const jsonResponse = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

describe('SearchHistoryComponent', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('検索履歴を削除できる', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(
        jsonResponse({ ok: true, history: [createHistoryItem()] })
      )
      .mockResolvedValueOnce(jsonResponse({ ok: true }))
      .mockResolvedValueOnce(jsonResponse({ ok: true, history: [] }));

    vi.spyOn(globalThis, 'fetch').mockImplementation(fetchMock as unknown as typeof fetch);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);

    render(<SearchHistoryComponent onReuse={() => undefined} />);

    await screen.findByText('テストキーワード');

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: '削除' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    const deleteCall = fetchMock.mock.calls[1];
    expect(deleteCall?.[0]).toBe('/api/history/1');
    expect(deleteCall?.[1]).toMatchObject({ method: 'DELETE' });

    await waitFor(() => {
      expect(screen.queryByText('テストキーワード')).not.toBeInTheDocument();
    });

    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('存在しない履歴でも成功として扱う', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(
        jsonResponse({ ok: true, history: [createHistoryItem()] })
      )
      .mockResolvedValueOnce(
        jsonResponse({ ok: false, message: 'Not found' }, { status: 404 })
      )
      .mockResolvedValueOnce(jsonResponse({ ok: true, history: [] }));

    vi.spyOn(globalThis, 'fetch').mockImplementation(fetchMock as unknown as typeof fetch);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);

    render(<SearchHistoryComponent onReuse={() => undefined} />);

    await screen.findByText('テストキーワード');

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: '削除' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    await waitFor(() => {
      expect(screen.queryByText('テストキーワード')).not.toBeInTheDocument();
    });

    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('削除に失敗した場合にアラートを表示する', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(
        jsonResponse({ ok: true, history: [createHistoryItem()] })
      )
      .mockResolvedValueOnce(
        jsonResponse({ ok: false, message: '削除できませんでした' }, { status: 404 })
      );

    vi.spyOn(globalThis, 'fetch').mockImplementation(fetchMock as unknown as typeof fetch);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);

    render(<SearchHistoryComponent onReuse={() => undefined} />);

    await screen.findByText('テストキーワード');

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: '削除' }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('削除できませんでした');
    });

    expect(screen.getByText('テストキーワード')).toBeInTheDocument();
  });
});
