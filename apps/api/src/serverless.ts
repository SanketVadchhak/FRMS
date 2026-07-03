import type { IncomingMessage, ServerResponse } from 'http';
import { app, registerPlugins } from './index';

// Cache the startup promise — reused across warm Lambda invocations
let appReady: Promise<void> | null = null;

async function getApp() {
  if (!appReady) {
    appReady = registerPlugins().then(() => app.ready());
  }
  await appReady;
  return app;
}

function applyCorsHeaders(req: IncomingMessage, res: ServerResponse) {
  const origin = req.headers['origin'] || '*';
  const allowedOrigins = (process.env.CORS_ORIGIN || '*').split(',').map(o => o.trim());
  const resolvedOrigin = allowedOrigins.includes('*') || allowedOrigins.includes(origin)
    ? origin
    : allowedOrigins[0] ?? '*';

  res.setHeader('Access-Control-Allow-Origin', resolvedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

// Export a handler for Vercel Serverless Functions
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  // Always send CORS headers — even if Fastify crashes during startup.
  // Without this, a startup error produces no CORS headers and the browser
  // reports a CORS error instead of the real underlying error.
  applyCorsHeaders(req, res);

  // Handle OPTIONS preflight immediately — no need to boot Fastify for this
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    const fastify = await getApp();
    fastify.server.emit('request', req, res);
  } catch (err: any) {
    console.error('SERVERLESS STARTUP ERROR:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: 'SERVERLESS_STARTUP_ERROR',
        message: err?.message || String(err),
      }),
    );
  }
}
