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

function applyCorsHeaders(req: any, res: any) {
  try {
    const origin = req?.headers?.origin || req?.headers?.Origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
  } catch (err) {
    console.error('Error applying CORS headers:', err);
  }
}

// Export a handler for Vercel Serverless Functions
export default async function handler(req: any, res: any) {
  try {
    applyCorsHeaders(req, res);

    if (req?.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    const fastify = await getApp();

    // Collect request body if present
    let payload: any = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.body !== undefined && req.body !== null) {
        payload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      } else {
        payload = await new Promise((resolve) => {
          let data = '';
          req.on('data', (chunk: any) => { data += chunk; });
          req.on('end', () => resolve(data));
          req.on('error', () => resolve(undefined));
        });
      }
    }

    const response = await fastify.inject({
      method: req.method,
      url: req.url || '/',
      headers: req.headers || {},
      payload,
    });

    res.statusCode = response.statusCode;
    for (const [key, val] of Object.entries(response.headers || {})) {
      if (val !== undefined) {
        res.setHeader(key, val as any);
      }
    }
    res.end(response.rawPayload);
  } catch (err: any) {
    console.error('SERVERLESS RUNTIME ERROR:', err);
    try {
      applyCorsHeaders(req, res);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'SERVERLESS_RUNTIME_ERROR',
          message: err?.message || String(err),
        }),
      );
    } catch (fallbackErr) {
      console.error('Fatal fallback error:', fallbackErr);
    }
  }
}
