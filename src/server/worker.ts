import type { D1Database } from '@cloudflare/workers-types';

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

export default worker;
