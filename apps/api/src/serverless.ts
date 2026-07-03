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

// Export a handler for Vercel Serverless Functions
export default async function handler(req: IncomingMessage, res: ServerResponse) {
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
