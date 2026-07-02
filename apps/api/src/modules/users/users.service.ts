import { UsersRepository } from './users.repository';
import { UserCreateInput, UserUpdateInput } from '@frms/shared';
import bcrypt from 'bcryptjs';
import { ConflictError, NotFoundError } from '../../utils/errors';

export class UsersService {
  constructor(private repo: UsersRepository) {}

  async listUsers(companyId: string) {
    const users = await this.repo.findAllByCompany(companyId);
    return users.map(u => ({
      id: u.id,
      username: u.username,
      status: u.status,
      role: u.roles[0]?.role.name || 'USER',
      createdAt: u.createdAt,
    }));
  }

  async createUser(companyId: string, input: UserCreateInput, createdBy: string) {
    // Basic checks
    const existing = await this.repo.findAllByCompany(companyId).then(users => users.find(u => u.username === input.username));
    if (existing) {
      throw new ConflictError('Username already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    
    // Create user
    const user = await this.repo.create({
      companyId,
      username: input.username,
      passwordHash,
      status: input.status,
    });

    // Assign Role
    // Assuming the input.role matches the role name in the DB
    const role = await this.repo.findRoleByName(companyId, input.role);
    if (role) {
      await this.repo.assignRole(user.id, role.id);
    }

    return { id: user.id };
  }

  async softDeleteUser(companyId: string, userId: string, deletedBy: string) {
    const user = await this.repo.findById(companyId, userId);
    if (!user) {
      throw new NotFoundError('User');
    }
    
    await this.repo.softDelete(companyId, userId, deletedBy);
  }
}
