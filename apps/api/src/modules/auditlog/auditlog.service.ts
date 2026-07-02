import { AuditLogRepository } from './auditlog.repository';

export class AuditLogService {
  constructor(private repo: AuditLogRepository) {}

  async list(companyId: string) {
    return this.repo.list(companyId);
  }
}
