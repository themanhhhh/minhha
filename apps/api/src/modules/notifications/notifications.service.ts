import { BadRequestException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { EnrollmentStatus, NotificationType, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { normalizePagination, paginationMeta } from '../../common/pagination';
import { notFound } from '../../common/http-errors';
import type { AuthPayload } from '../auth/auth.types';
import { CreateBroadcastDto } from './dto/create-broadcast.dto';
import { ListNotificationDto } from './dto/list-notification.dto';

export interface NotificationDraft {
  type: NotificationType;
  title: string;
  body: string;
  actionUrl?: string;
  entity?: string;
  entityId?: string | number | bigint;
  metadata?: Prisma.InputJsonValue;
  dedupeKey?: string;
  createdById?: string | number | bigint;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string, query: ListNotificationDto) {
    const recipientId = this.parseId(userId, 'userId');
    const pagination = normalizePagination(query);
    const where: Prisma.NotificationWhereInput = {
      recipientId,
      ...(query.unreadOnly ? { readAt: null } : {}),
    };
    const [notifications, total, unreadCount] = await this.prisma.$transaction([
      this.prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, skip: pagination.skip, take: pagination.take }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { recipientId, readAt: null } }),
    ]);

    return {
      data: notifications.map((notification) => this.toResponse(notification)),
      meta: { ...paginationMeta(pagination.page, pagination.pageSize, total), unreadCount },
    };
  }

  async unreadCount(userId: string) {
    const count = await this.prisma.notification.count({ where: { recipientId: this.parseId(userId, 'userId'), readAt: null } });
    return { data: { count } };
  }

  async markRead(userId: string, notificationId: string) {
    const recipientId = this.parseId(userId, 'userId');
    const id = this.parseId(notificationId, 'notificationId');
    const result = await this.prisma.notification.updateMany({ where: { id, recipientId, readAt: null }, data: { readAt: new Date() } });
    if (result.count === 0) {
      const existing = await this.prisma.notification.findFirst({ where: { id, recipientId }, select: { id: true } });
      if (!existing) notFound('Notification', notificationId);
    }
    const notification = await this.prisma.notification.findFirst({ where: { id, recipientId } });
    if (!notification) notFound('Notification', notificationId);
    return { data: this.toResponse(notification) };
  }

  async markAllRead(userId: string) {
    const result = await this.prisma.notification.updateMany({ where: { recipientId: this.parseId(userId, 'userId'), readAt: null }, data: { readAt: new Date() } });
    return { data: { updatedCount: result.count } };
  }

  async broadcast(dto: CreateBroadcastDto, user: AuthPayload) {
    const classId = this.parseId(dto.classId, 'classId');
    const classRoom = await this.prisma.class.findUnique({ where: { id: classId }, select: { id: true, code: true, name: true, teacherId: true } });
    if (!classRoom) notFound('Class', dto.classId);
    await this.assertBroadcastAccess(classRoom.teacherId, user);

    const recipients = await this.prisma.enrollment.findMany({
      where: { classId, status: EnrollmentStatus.ACTIVE },
      select: { student: { select: { userId: true } } },
    });
    const data = recipients.map(({ student }) => ({
      recipientId: student.userId,
      createdById: this.parseId(user.sub, 'userId'),
      type: NotificationType.BROADCAST,
      title: dto.title.trim(),
      body: dto.body.trim(),
      actionUrl: dto.actionUrl,
      entity: 'Class',
      entityId: classId.toString(),
      metadata: { classCode: classRoom.code, className: classRoom.name } as Prisma.InputJsonValue,
    }));
    const result = data.length ? await this.prisma.notification.createMany({ data }) : { count: 0 };
    return { data: { classId: classId.toString(), recipientCount: result.count } };
  }

  async notifyStudent(studentId: string | number | bigint, draft: NotificationDraft) {
    try {
      const student = await this.prisma.student.findUnique({ where: { id: this.toBigInt(studentId) }, select: { userId: true } });
      if (!student) return 0;
      return await this.createForRecipients([student.userId], draft);
    } catch (error) {
      this.logFailure(error, draft);
      return 0;
    }
  }

  async notifyClassStudents(classId: string | number | bigint, draft: NotificationDraft) {
    try {
      const enrollments = await this.prisma.enrollment.findMany({
        where: { classId: this.toBigInt(classId), status: EnrollmentStatus.ACTIVE },
        select: { student: { select: { userId: true } } },
      });
      return await this.createForRecipients(enrollments.map(({ student }) => student.userId), draft);
    } catch (error) {
      this.logFailure(error, draft);
      return 0;
    }
  }

  private async createForRecipients(recipientIds: bigint[], draft: NotificationDraft) {
    if (!recipientIds.length) return 0;
    const data = recipientIds.map((recipientId) => ({
      recipientId,
      createdById: draft.createdById === undefined ? undefined : this.toBigInt(draft.createdById),
      type: draft.type,
      title: draft.title,
      body: draft.body,
      actionUrl: draft.actionUrl,
      entity: draft.entity,
      entityId: draft.entityId === undefined ? undefined : String(draft.entityId),
      metadata: draft.metadata,
      dedupeKey: draft.dedupeKey ? `${draft.dedupeKey}:recipient:${recipientId.toString()}` : undefined,
    }));
    const result = await this.prisma.notification.createMany({ data, skipDuplicates: true });
    return result.count;
  }

  private async assertBroadcastAccess(teacherId: bigint, user: AuthPayload) {
    if (user.role === UserRole.ACADEMIC_STAFF) return;
    if (user.role !== UserRole.TEACHER) throw new ForbiddenException('You cannot send class notifications');
    const teacher = await this.prisma.teacher.findUnique({ where: { userId: this.parseId(user.sub, 'userId') }, select: { id: true } });
    if (!teacher || teacher.id !== teacherId) throw new ForbiddenException('You do not manage this class');
  }

  private toResponse(notification: { id: bigint; type: NotificationType; title: string; body: string; actionUrl: string | null; entity: string | null; entityId: string | null; metadata: Prisma.JsonValue | null; readAt: Date | null; createdAt: Date }) {
    return {
      id: notification.id.toString(),
      type: notification.type,
      title: notification.title,
      body: notification.body,
      actionUrl: notification.actionUrl,
      entity: notification.entity,
      entityId: notification.entityId,
      metadata: notification.metadata,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
    };
  }

  private parseId(value: string | number | bigint, name: string) {
    try {
      const parsed = this.toBigInt(value);
      if (parsed < 1n) throw new Error('non-positive');
      return parsed;
    } catch {
      throw new BadRequestException(`${name} must be a positive integer`);
    }
  }

  private toBigInt(value: string | number | bigint) {
    return typeof value === 'bigint' ? value : BigInt(value);
  }

  private logFailure(error: unknown, draft: NotificationDraft) {
    this.logger.error(`Unable to create ${draft.type} notification`, error instanceof Error ? error.stack : String(error));
  }
}
