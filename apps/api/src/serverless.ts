import { FastifyRequest, FastifyReply } from 'fastify';

// Export a handler for Vercel Serverless Functions
export default async function (req: any, res: any) {
  try {
    const { app } = await import('./index');
    // We need to wait for Fastify to be ready before processing requests
    await app.ready();
    
    // Hand off the Vercel request to Fastify
    app.server.emit('request', req, res);
  } catch (err: any) {
    console.error('SERVERLESS STARTUP ERROR:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'SERVERLESS_STARTUP_ERROR',
      message: err?.message || String(err),
      stack: err?.stack,
    }));
  }
}
