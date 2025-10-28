import type { D1Database } from '@cloudflare/workers-types';
import type { SaveHistoryRequest, SearchRequest } from '../lib/types';

export interface Env {
  DB: D1Database;
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (url.pathname === '/api/history/save' && request.method === 'POST') {
        return await handleSaveHistory(request, env, corsHeaders);
      }

      if (url.pathname?.match(/^\/api\/history\/[0-9]+$/) && request.method === 'DELETE') {
        const id = Number(url.pathname.split('/').pop());
        return await handleDeleteHistory(id, env, corsHeaders);
      }

      if (url.pathname === '/api/history' && request.method === 'GET') {
        return await handleGetHistory(env, corsHeaders);
      }

      if (url.pathname === '/health') {
        const { results } = await env.DB.prepare('SELECT datetime("now") as now').all();
        const now = results?.[0]?.now ?? 'unknown';
        return new Response(JSON.stringify({ status: 'ok', now }), {
          headers: corsHeaders,
        });
      }

      return new Response(JSON.stringify({ ok: false, message: 'Not found' }), {
        status: 404,
        headers: corsHeaders,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      return new Response(JSON.stringify({ ok: false, message }), {
        status: 500,
        headers: corsHeaders,
      });
    }
  },
};

async function handleSaveHistory(
  request: Request,
  env: Env,
  headers: Record<string, string>
): Promise<Response> {
  const body = await request.json() as SaveHistoryRequest;
  const { searchRequest, videos } = body;

  const historyInsert = await env.DB.prepare(`
    INSERT INTO search_history (
      keyword, region, min_subscribers, max_subscribers,
      min_views, max_views, published_within, video_duration,
      exclude_keywords, include_shorts, result_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    searchRequest.keyword,
    searchRequest.region,
    searchRequest.minSubscribers,
    searchRequest.maxSubscribers ?? null,
    searchRequest.minViews,
    searchRequest.maxViews ?? null,
    searchRequest.publishedWithin,
    searchRequest.videoDuration,
    searchRequest.excludeKeywords,
    searchRequest.includeShorts ? 1 : 0,
    videos.length
  ).run();

  const historyId = historyInsert.meta.last_row_id;

  if (videos.length > 0 && historyId) {
    const batch = videos.map(video =>
      env.DB.prepare(`
        INSERT INTO search_results (
          history_id, video_id, title, video_url, channel_id,
          channel_name, channel_url, views, subscribers,
          published_at, channel_published_at, growth_score, is_short
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        historyId,
        video.videoId,
        video.title,
        video.videoUrl,
        video.channelId,
        video.channelName,
        video.channelUrl,
        video.views,
        video.subscribers,
        video.publishedAt,
        video.channelPublishedAt,
        video.growthScore,
        video.isShort ? 1 : 0
      )
    );

    await env.DB.batch(batch);
  }

  return new Response(JSON.stringify({ ok: true, historyId }), { headers });
}

async function handleGetHistory(
  env: Env,
  headers: Record<string, string>
): Promise<Response> {
  const { results } = await env.DB.prepare(`
    SELECT
      id, keyword, region, min_subscribers as minSubscribers,
      max_subscribers as maxSubscribers, min_views as minViews,
      max_views as maxViews, published_within as publishedWithin,
      video_duration as videoDuration, exclude_keywords as excludeKeywords,
      include_shorts as includeShorts, result_count as resultCount,
      searched_at as searchedAt
    FROM search_history
    ORDER BY searched_at DESC
    LIMIT 50
  `).all();

  const history = (results ?? []).map(row => ({
    ...row,
    includeShorts: Boolean(row.includeShorts),
    videoDuration: (row.videoDuration ?? 'any') as SearchRequest['videoDuration'],
    excludeKeywords: row.excludeKeywords ?? '',
  }));

  return new Response(JSON.stringify({ ok: true, history }), { headers });
}

async function handleDeleteHistory(
  id: number,
  env: Env,
  headers: Record<string, string>
): Promise<Response> {
  if (!Number.isInteger(id) || id <= 0) {
    return new Response(JSON.stringify({ ok: false, message: 'invalid id' }), {
      status: 400,
      headers,
    });
  }

  await env.DB.prepare('DELETE FROM search_results WHERE history_id = ?')
    .bind(id)
    .run();

  const result = await env.DB.prepare('DELETE FROM search_history WHERE id = ?')
    .bind(id)
    .run();

  const deleted = result.meta.changes ?? 0;
  if (deleted === 0) {
    return new Response(JSON.stringify({ ok: false, message: 'not found' }), {
      status: 404,
      headers,
    });
  }

  return new Response(JSON.stringify({ ok: true }), { headers });
}

export default worker;
