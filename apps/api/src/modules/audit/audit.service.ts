import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { normalizePagination, paginationMeta } from '../../common/pagination';
import { ListAuditDto } from './dto/list-audit.dto';

export interface AuditInput { actorId?: string; action: string; entity: string; entityId?: string; oldValue?: unknown; newValue?: unknown; ipAddress?: string; userAgent?: string; }

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async write(input: AuditInput) {
    return this.prisma.auditLog.create({ data: { actorId: input.actorId ? BigInt(input.actorId) : undefined, action: input.action, entity: input.entity, entityId: input.entityId, oldValue: input.oldValue as Prisma.InputJsonValue | undefined, newValue: input.newValue as Prisma.InputJsonValue | undefined, ipAddress: input.ipAddress, userAgent: input.userAgent } });
  }

  async findAll(query: ListAuditDto) {
    const pagination = normalizePagination(query);
    const where: Prisma.AuditLogWhereInput = { ...(query.entity ? { entity: query.entity } : {}), ...(query.action ? { action: query.action } : {}) };
    const [logs, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({ where, include: { actor: { select: { id: true, fullName: true, email: true, role: true } }, }, orderBy: { createdAt: 'desc' }, skip: pagination.skip, take: pagination.take }),
      this.prisma.auditLog.count({ where }),
    ]);
    return { data: logs.map((log) => ({ id: log.id.toString(), actor: log.actor ? { ...log.actor, id: log.actor.id.toString() } : null, action: log.action, entity: log.entity, entityId: log.entityId, oldValue: log.oldValue, newValue: log.newValue, createdAt: log.createdAt })), meta: paginationMeta(pagination.page, pagination.pageSize, total) };
  }
}
