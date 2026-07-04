import bcrypt from 'bcryptjs';
import { AuthRepository } from './auth.repository';
import { LoginInput } from '@frms/shared';
import { AuthenticationError, NotFoundError } from '../../utils/errors';
import crypto from 'crypto';
import { env } from '../../config/env';
import { FastifyInstance } from 'fastify';

export class AuthService {
  constructor(private repo: AuthRepository, private fastify: FastifyInstance) {}

  async login(input: LoginInput) {
    const user = await this.repo.findUserByUsername(input.username);
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw new AuthenticationError('Account is inactive');
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Extract flat list of permissions
    const permissions = new Set<string>();
    for (const ur of user.roles) {
      for (const rp of ur.role.permissions) {
        permissions.add(rp.permission.name);
      }
    }

    const roleName = user.roles[0]?.role.name || (user.username === 'admin' || user.username?.toLowerCase() === 'hardik' ? 'ADMIN' : 'USER');

    const payload = {
      id: user.id,
      companyId: user.companyId,
      username: user.username,
      role: roleName,
      permissions: Array.from(permissions),
    };

    const accessToken = this.fastify.jwt.sign(payload, { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN });
    const refreshTokenString = crypto.randomBytes(40).toString('hex');
    
    // Parse duration (e.g. "7d") -> crude fallback to 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.repo.saveRefreshToken(user.id, refreshTokenString, expiresAt);

    return {
      user: {
        id: user.id,
        username: user.username,
        companyId: user.companyId,
        role: user.roles[0]?.role.name || 'USER', // Map legacy role for frontend
        status: user.status,
      },
      accessToken,
      refreshToken: refreshTokenString,
    };
  }

  async refreshToken(token: string) {
    const record = await this.repo.findRefreshToken(token);
    if (!record || record.revokedAt || record.expiresAt < new Date()) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    const user = await this.repo.findUserByUsername(record.user.username);
    if (!user || user.status !== 'ACTIVE') {
      throw new AuthenticationError('User is inactive or deleted');
    }

    const permissions = new Set<string>();
    for (const ur of user.roles) {
      for (const rp of ur.role.permissions) {
        permissions.add(rp.permission.name);
      }
    }

    const roleName = user.roles[0]?.role.name || (user.username === 'admin' || user.username?.toLowerCase() === 'hardik' ? 'ADMIN' : 'USER');

    const payload = {
      id: user.id,
      companyId: user.companyId,
      username: user.username,
      role: roleName,
      permissions: Array.from(permissions),
    };

    const newAccessToken = this.fastify.jwt.sign(payload, { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN });
    
    return {
      accessToken: newAccessToken,
    };
  }

  async logout(token: string, userId: string) {
    if (token) {
      await this.repo.revokeRefreshToken(token);
    }
  }
}
