import type { D1Database } from '@cloudflare/workers-types';

export interface Env {
  DB: D1Database;
}

const worker = {
  async fetch(_request: Request, env: Env): Promise<Response> {
    const { results } = await env.DB.prepare('SELECT datetime("now") as now').all();
    const now = results?.[0]?.now ?? 'unknown';
    return new Response(JSON.stringify({ status: 'ok', now }), {
      headers: { 'content-type': 'application/json' },
    });
  },
};

export default worker;
