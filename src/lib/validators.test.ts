import { describe, expect, it } from 'vitest';
import { parseSearchRequest, sanitizeVideoResult } from './validators';

describe('parseSearchRequest', () => {
  it('parses valid payload', () => {
    const payload = {
      keyword: 'テスト',
      region: 'jp',
      minSubscribers: 100,
      minViews: 5000,
      publishedWithin: '30',
      videoDuration: 'any',
      excludeKeywords: '',
      includeShorts: true,
      maxSubscribers: null,
      maxViews: null,
    };

    expect(parseSearchRequest(payload)).toEqual(payload);
  });

  it('throws when keyword is empty', () => {
    expect(() =>
      parseSearchRequest({
        keyword: '   ',
        region: 'jp',
        minSubscribers: 0,
        minViews: 0,
        publishedWithin: 'any',
        videoDuration: 'any',
        excludeKeywords: '',
        includeShorts: true,
        maxSubscribers: null,
        maxViews: null,
      }),
    ).toThrow();
  });
});

describe('sanitizeVideoResult', () => {
  it('rounds growth score to 2 decimals', () => {
    const result = sanitizeVideoResult({
      videoId: 'abc',
      title: 'Video',
      videoUrl: 'https://example.com',
      channelId: 'chan',
      channelName: 'Channel',
      channelUrl: 'https://example.com/channel',
      views: 1000,
      subscribers: 123,
      publishedAt: new Date().toISOString(),
      channelPublishedAt: new Date().toISOString(),
      growthScore: 1.23456,
      isShort: false,
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
    });

    expect(result.growthScore).toBe(1.23);
  });
});
