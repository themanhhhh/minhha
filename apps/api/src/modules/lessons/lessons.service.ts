import { BadRequestException, ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { ClassStatus, LessonStatus, NotificationType, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { normalizePagination, paginationMeta } from '../../common/pagination';
import { notFound } from '../../common/http-errors';
import type { AuthPayload } from '../auth/auth.types';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { ListLessonDto } from './dto/list-lesson.dto';
import { RecordLessonDto } from './dto/record-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService, private readonly notifications: NotificationsService) {}

  async findAll(query: ListLessonDto, user: AuthPayload) {
    const pagination = normalizePagination(query);
    const where: Prisma.LessonWhereInput = {
      status: query.status ?? { not: LessonStatus.CANCELLED },
      ...(query.fromDate || query.toDate ? { lessonDate: { ...(query.fromDate ? { gte: this.toDateOnly(query.fromDate) } : {}), ...(query.toDate ? { lte: this.toDateOnly(query.toDate) } : {}) } } : {}),
      ...(user.role === UserRole.TEACHER ? { OR: [{ class: { teacher: { userId: BigInt(user.sub) } } }, { substituteTeacher: { userId: BigInt(user.sub) } }] } : {}),
      ...(user.role === UserRole.STUDENT ? { class: { enrollments: { some: { student: { userId: BigInt(user.sub) }, status: 'ACTIVE' } } } } : {}),
    };
    const [lessons, total] = await this.prisma.$transaction([
      this.prisma.lesson.findMany({ where, include: { class: true, _count: { select: { attendance: true } } }, orderBy: [{ lessonDate: 'asc' }, { startTime: 'asc' }], skip: pagination.skip, take: pagination.take }),
      this.prisma.lesson.count({ where }),
    ]);
    return { data: lessons.map((lesson) => this.toResponse(lesson)), meta: paginationMeta(pagination.page, pagination.pageSize, total) };
  }

  async findByClass(classId: string, query: ListLessonDto, user: AuthPayload) {
    await this.assertClassAccess(classId, user, false);
    const pagination = normalizePagination(query);
    const where: Prisma.LessonWhereInput = { classId: BigInt(classId), status: query.status ?? { not: LessonStatus.CANCELLED }, ...(query.fromDate || query.toDate ? { lessonDate: { ...(query.fromDate ? { gte: this.toDateOnly(query.fromDate) } : {}), ...(query.toDate ? { lte: this.toDateOnly(query.toDate) } : {}) } } : {}) };
    const [lessons, total] = await this.prisma.$transaction([this.prisma.lesson.findMany({ where, include: { class: true, _count: { select: { attendance: true } } }, orderBy: [{ lessonDate: 'asc' }, { startTime: 'asc' }], skip: pagination.skip, take: pagination.take }), this.prisma.lesson.count({ where })]);
    return { data: lessons.map((lesson) => this.toResponse(lesson)), meta: paginationMeta(pagination.page, pagination.pageSize, total) };
  }

  async findOne(id: string, user: AuthPayload) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id: BigInt(id) }, include: { class: { include: { course: true, teacher: { include: { user: true } } } }, _count: { select: { attendance: true } } } });
    if (!lesson) notFound('Lesson', id);
    await this.assertLessonAccess(lesson, user, false);
    return this.toResponse(lesson);
  }

  async create(dto: CreateLessonDto, user: AuthPayload) {
    await this.assertClassAccess(dto.classId, user, true);
    this.assertTimeRange(dto.startTime, dto.endTime);
    const classRoom = await this.getClass(dto.classId);
    await this.assertNoScheduleConflict({ ...classRoom, teacherId: dto.substituteTeacherId ? BigInt(dto.substituteTeacherId) : classRoom.teacherId }, dto.lessonDate, dto.startTime, dto.endTime);
    const lesson = await this.prisma.lesson.create({ data: { substituteTeacherId: dto.substituteTeacherId ? BigInt(dto.substituteTeacherId) : undefined, classId: BigInt(dto.classId), title: dto.title, lessonDate: this.toDateOnly(dto.lessonDate), startTime: this.toTime(dto.startTime), endTime: this.toTime(dto.endTime), content: dto.content, recordUrl: dto.recordUrl, status: dto.status ?? LessonStatus.UPCOMING }, include: { class: true, _count: { select: { attendance: true } } } });
    await this.notifications.notifyClassStudents(lesson.classId, { type: NotificationType.LESSON_CREATED, title: 'Có buổi học mới', body: `Lớp học có buổi học mới: ${lesson.title}.`, actionUrl: `/student/classes/${lesson.classId.toString()}`, entity: 'Lesson', entityId: lesson.id, dedupeKey: `lesson:${lesson.id.toString()}:created` });
    return this.toResponse(lesson);
  }

  async update(id: string, dto: UpdateLessonDto, user: AuthPayload) {
    const current = await this.prisma.lesson.findUnique({ where: { id: BigInt(id) } });
    if (!current) notFound('Lesson', id);
    const classId = dto.classId ?? current.classId.toString();
    await this.assertClassAccess(classId, user, true);
    const startTime = dto.startTime ?? this.formatTime(current.startTime);
    const endTime = dto.endTime ?? this.formatTime(current.endTime);
    this.assertTimeRange(startTime, endTime);
    const classRoom = await this.getClass(classId);
    await this.assertNoScheduleConflict({ ...classRoom, teacherId: dto.substituteTeacherId ? BigInt(dto.substituteTeacherId) : current.substituteTeacherId ?? classRoom.teacherId }, dto.lessonDate ?? this.formatDate(current.lessonDate), startTime, endTime, BigInt(id));
    const changed = dto.classId !== undefined || dto.title !== undefined || dto.lessonDate !== undefined || dto.startTime !== undefined || dto.endTime !== undefined || dto.content !== undefined || dto.status !== undefined;
    const lesson = await this.prisma.lesson.update({ where: { id: BigInt(id) }, data: { ...(dto.substituteTeacherId !== undefined ? { substituteTeacherId: BigInt(dto.substituteTeacherId) } : {}), ...(dto.classId ? { classId: BigInt(dto.classId) } : {}), ...(dto.title ? { title: dto.title } : {}), ...(dto.lessonDate ? { lessonDate: this.toDateOnly(dto.lessonDate) } : {}), ...(dto.startTime ? { startTime: this.toTime(dto.startTime) } : {}), ...(dto.endTime ? { endTime: this.toTime(dto.endTime) } : {}), ...(dto.content !== undefined ? { content: dto.content } : {}), ...(dto.recordUrl !== undefined ? { recordUrl: dto.recordUrl } : {}), ...(dto.status ? { status: dto.status } : {}) }, include: { class: true, _count: { select: { attendance: true } } } });
    if (changed) { const draft = { type: NotificationType.LESSON_UPDATED, title: 'Buổi học đã được cập nhật', body: `Thông tin buổi học "${lesson.title}" đã thay đổi.`, actionUrl: `/student/classes/${lesson.classId.toString()}`, entity: 'Lesson', entityId: lesson.id, dedupeKey: `lesson:${lesson.id.toString()}:updated:${lesson.updatedAt.toISOString()}` }; await this.notifications.notifyClassStudents(lesson.classId, draft); if (current.classId !== lesson.classId) await this.notifications.notifyClassStudents(current.classId, { ...draft, actionUrl: `/student/classes/${current.classId.toString()}` }); }
    return this.toResponse(lesson);
  }

  async updateRecord(id: string, dto: RecordLessonDto, user: AuthPayload) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id: BigInt(id) } });
    if (!lesson) notFound('Lesson', id);
    await this.assertLessonAccess(lesson, user, true);
    if (lesson.startsAt > new Date()) throw new BadRequestException("Record is only available after the lesson starts");
    const updated = await this.prisma.lesson.update({ where: { id: BigInt(id) }, data: { recordUrl: dto.recordUrl ?? null }, include: { class: true, _count: { select: { attendance: true } } } });
    return this.toResponse(updated);
  }

  private async assertLessonAccess(lesson: { classId: bigint; substituteTeacherId: bigint | null }, user: AuthPayload, write: boolean) {
    if (user.role === UserRole.TEACHER && lesson.substituteTeacherId) {
      const teacher = await this.prisma.teacher.findUnique({ where: { userId: BigInt(user.sub) } });
      if (teacher?.id === lesson.substituteTeacherId) return;
    }
    await this.assertClassAccess(String(lesson.classId), user, write);
  }
  private async getClass(classId: string) { const classRoom = await this.prisma.class.findUnique({ where: { id: BigInt(classId) } }); if (!classRoom) notFound('Class', classId); return classRoom; }
  private async assertClassAccess(classId: string, user: AuthPayload, write: boolean) { const classRoom = await this.getClass(classId); if (user.role === UserRole.ACADEMIC_STAFF) return classRoom; if (user.role === UserRole.DIRECTOR && !write) return classRoom; if (user.role === UserRole.TEACHER) { const teacher = await this.prisma.teacher.findUnique({ where: { userId: BigInt(user.sub) } }); if (!teacher || teacher.id !== classRoom.teacherId) throw new ForbiddenException('You do not manage this class'); return classRoom; } if (user.role === UserRole.STUDENT && !write) { const enrollment = await this.prisma.enrollment.findUnique({ where: { studentId_classId: { studentId: BigInt((await this.prisma.student.findUnique({ where: { userId: BigInt(user.sub) } }))?.id ?? 0n), classId: BigInt(classId) } } }); if (!enrollment || enrollment.status !== 'ACTIVE') throw new ForbiddenException('You are not enrolled in this class'); return classRoom; } throw new ForbiddenException('You do not have access to this class'); }
  private async assertNoScheduleConflict(classRoom: { id: bigint; teacherId: bigint; room: string | null }, lessonDate: string, start: string, end: string, ignoreId?: bigint) { const date = this.toDateOnly(lessonDate); const lessons = await this.prisma.lesson.findMany({ where: { lessonDate: date, status: { notIn: [LessonStatus.CANCELLED, LessonStatus.POSTPONED] }, OR: [{ substituteTeacherId: classRoom.teacherId }, { substituteTeacherId: null, class: { teacherId: classRoom.teacherId } }, ...(classRoom.room ? [{ class: { room: classRoom.room } }] : [])] }, include: { class: true } }); const startMs = this.toTime(start).getTime(); const endMs = this.toTime(end).getTime(); const conflict = lessons.find((lesson) => lesson.id !== ignoreId && startMs < lesson.endTime.getTime() && endMs > lesson.startTime.getTime()); if (conflict) throw new ConflictException('Teacher or room has another lesson at this time'); }
  private assertTimeRange(start: string, end: string) { if (this.toTime(start).getTime() >= this.toTime(end).getTime()) throw new BadRequestException('endTime must be after startTime'); }
  private toDateOnly(value: string) { return new Date(`${value.slice(0, 10)}T00:00:00.000Z`); }
  private toTime(value: string) { return new Date(`1970-01-01T${value}:00.000Z`); }
  private formatDate(value: Date) { return value.toISOString().slice(0, 10); }
  private formatTime(value: Date) { return value.toISOString().slice(11, 16); }
  private toResponse(lesson: any) { return { id: lesson.id.toString(), classId: lesson.classId.toString(), classCode: lesson.class.code, className: lesson.class.name, room: lesson.class.room, title: lesson.title, lessonDate: lesson.lessonDate, startTime: this.formatTime(lesson.startTime), endTime: this.formatTime(lesson.endTime), content: lesson.content, startsAt: lesson.startsAt, endsAt: lesson.endsAt, substituteTeacherId: lesson.substituteTeacherId?.toString(), recordUrl: lesson.recordUrl, status: lesson.status, attendanceCount: lesson._count?.attendance ?? 0 }; }
}
