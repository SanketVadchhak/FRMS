import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthenticationError, AuthorizationError } from '../utils/errors';

export async function verifyToken(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    // jwtVerify automatically populates request.user with the decoded payload
  } catch (err) {
    throw new AuthenticationError('Invalid or expired token');
  }
}

export function requirePermissions(permissions: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // We expect request.user to contain { id, companyId, username, permissions }
    const userPermissions = (request.user as any)?.permissions || [];
    
    const hasAll = permissions.every(p => userPermissions.includes(p));
    if (!hasAll) {
      throw new AuthorizationError(`Required permissions: ${permissions.join(', ')}`);
    }
  };
}

import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: string; companyId: string; username: string; permissions: string[] };
    user: { id: string; companyId: string; username: string; permissions: string[] };
  }
}
