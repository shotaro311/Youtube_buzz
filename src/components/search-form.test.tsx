import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SearchForm } from './search-form';

describe('SearchForm', () => {
  it('calls onSubmit with form values', () => {
    const handleSubmit = vi.fn();
    render(<SearchForm onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText('検索キーワード'), {
      target: { value: 'キャンプ ギア' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'バズ動画を検索' }));

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        keyword: 'キャンプ ギア',
        region: 'jp',
        maxSubscribers: null,
        maxViews: null,
      }),
    );
  });
});
