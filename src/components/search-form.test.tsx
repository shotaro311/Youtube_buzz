import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SearchForm } from './search-form';
import { defaultSearchRequest } from '@/lib/search-request';

describe('SearchForm', () => {
  it('calls onSubmit with form values', () => {
    const handleSubmit = vi.fn();

    function Wrapper() {
      const [value, setValue] = useState(defaultSearchRequest);
      return (
        <SearchForm
          value={value}
          onChange={patch => setValue(prev => ({ ...prev, ...patch }))}
          onSubmit={handleSubmit}
        />
      );
    }

    render(<Wrapper />);

    fireEvent.change(screen.getByLabelText('検索キーワード'), {
      target: { value: 'キャンプ ギア' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'バズ動画を検索' }));

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        keyword: 'キャンプ ギア',
        region: 'jp',
        videoDuration: 'any',
        excludeKeywords: '',
        maxSubscribers: null,
        maxViews: null,
      }),
    );
  });
});
