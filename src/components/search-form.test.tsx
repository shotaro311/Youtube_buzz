import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SearchForm, defaultSearchFormState } from './search-form';

describe('SearchForm', () => {
  it('calls onSubmit with form values', () => {
    const handleSubmit = vi.fn();

    function Wrapper() {
      const [value, setValue] = useState(defaultSearchFormState);
      return <SearchForm value={value} onChange={setValue} onSubmit={handleSubmit} />;
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
