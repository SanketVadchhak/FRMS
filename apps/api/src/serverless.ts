import type { IncomingMessage, ServerResponse } from 'http';

// Cache the Fastify instance across warm invocations in the same Lambda container
let appReady: Promise<void> | null = null;

async function getApp() {
  const { app, registerPlugins } = await import('./index');

  if (!appReady) {
    appReady = registerPlugins().then(() => app.ready());
  }

  await appReady;
  return app;
}

// Export a handler for Vercel Serverless Functions
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const app = await getApp();
    app.server.emit('request', req, res);
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
