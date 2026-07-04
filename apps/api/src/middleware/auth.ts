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
    const user = request.user as any;
    if (!user) {
      throw new AuthorizationError('Not authenticated');
    }

    // ADMIN role or admin usernames bypass all permission checks
    const roleName = user.role ? String(user.role).toUpperCase() : '';
    if (roleName === 'ADMIN' || roleName === 'SUPERADMIN' || user.username === 'admin' || user.username?.toLowerCase() === 'hardik') {
      return;
    }

    const userPermissions = user.permissions || [];
    const hasAll = permissions.every(p => userPermissions.includes(p) || userPermissions.includes('*'));
    if (!hasAll) {
      throw new AuthorizationError(`Required permissions: ${permissions.join(', ')}`);
    }
  };
}

import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: string; companyId: string; username: string; role?: string; permissions: string[] };
    user: { id: string; companyId: string; username: string; role?: string; permissions: string[] };
  }
}
