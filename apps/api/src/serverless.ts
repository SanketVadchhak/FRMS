import { FastifyRequest, FastifyReply } from 'fastify';
import { app } from './index';

// Export a handler for Vercel Serverless Functions
export default async function (req: any, res: any) {
  // We need to wait for Fastify to be ready before processing requests
  await app.ready();
  
  // Hand off the Vercel request to Fastify
  app.server.emit('request', req, res);
}
