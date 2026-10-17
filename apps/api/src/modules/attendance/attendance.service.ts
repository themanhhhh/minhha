import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { AttendanceStatus, EnrollmentStatus, NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import type { AuthPayload } from '../auth/auth.types';
import { TeachingAccessService } from '../teaching/teaching-access.service';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService, private readonly access: TeachingAccessService, private readonly audit: AuditService, private readonly notifications: NotificationsService) {}

  async findByLesson(lessonId: string, user: AuthPayload) {
    const lesson = await this.access.assertLesson(lessonId, user, false);
    const enrollments = await this.prisma.enrollment.findMany({ where: { classId: lesson.classId, status: EnrollmentStatus.ACTIVE }, include: { student: { include: { user: true } } }, orderBy: { student: { studentCode: 'asc' } } });
    const entries = await this.prisma.attendance.findMany({ where: { lessonId: BigInt(lessonId) } });
    const ownStudentId = user.role === 'STUDENT' ? (await this.prisma.student.findUnique({ where: { userId: BigInt(user.sub) } }))?.id : null;
    const visible = ownStudentId ? enrollments.filter((item) => item.studentId === ownStudentId) : enrollments;
    return { data: visible.map((item) => { const attendance = entries.find((entry) => entry.studentId === item.studentId); return { id: attendance?.id?.toString() ?? null, lessonId: lessonId, studentId: item.studentId.toString(), code: item.student.studentCode, fullName: item.student.user.fullName, status: attendance?.status ?? null, note: attendance?.note ?? null }; }) };
  }

  async update(lessonId: string, dto: UpdateAttendanceDto, user: AuthPayload) {
    const lesson = await this.access.assertLesson(lessonId, user, true);
    const enrollments = await this.prisma.enrollment.findMany({ where: { classId: lesson.classId, status: EnrollmentStatus.ACTIVE }, select: { studentId: true } });
    const allowed = new Set(enrollments.map((item) => item.studentId.toString()));
    const uniqueStudents = new Set(dto.entries.map((entry) => entry.studentId));
    if (uniqueStudents.size !== dto.entries.length) throw new BadRequestException('Duplicate student in attendance payload');
    if (dto.entries.some((entry) => !allowed.has(entry.studentId))) throw new BadRequestException('Every student must belong to the class');
    const previous = await this.prisma.attendance.findMany({ where: { lessonId: BigInt(lessonId), studentId: { in: dto.entries.map((entry) => BigInt(entry.studentId)) } }, select: { studentId: true, status: true } });
    const previousStatus = new Map(previous.map((entry) => [entry.studentId.toString(), entry.status]));
    try { await this.prisma.$transaction(dto.entries.map((entry) => this.prisma.attendance.upsert({ where: { lessonId_studentId: { lessonId: BigInt(lessonId), studentId: BigInt(entry.studentId) } }, update: { status: entry.status, note: entry.note }, create: { lessonId: BigInt(lessonId), studentId: BigInt(entry.studentId), status: entry.status, note: entry.note } }))); } catch (error) { if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('Attendance entry already exists'); throw error; }
    for (const entry of dto.entries) { if ((entry.status === AttendanceStatus.ABSENT || entry.status === AttendanceStatus.LATE) && previousStatus.get(entry.studentId) !== entry.status) await this.notifications.notifyStudent(entry.studentId, { type: NotificationType.ATTENDANCE_ALERT, title: entry.status === AttendanceStatus.ABSENT ? 'Bạn bị ghi nhận vắng' : 'Bạn bị ghi nhận đi muộn', body: `Điểm danh buổi học "${lesson.title}" đã được cập nhật.`, actionUrl: `/student/classes/${lesson.classId.toString()}`, entity: 'Attendance', entityId: lessonId, dedupeKey: `attendance:${lessonId}:${entry.studentId}:${entry.status}` }); }
    await this.audit.write({ actorId: user.sub, action: 'UPDATE', entity: 'Attendance', entityId: lessonId, newValue: { count: dto.entries.length } });
    return this.findByLesson(lessonId, user);
  }
}
