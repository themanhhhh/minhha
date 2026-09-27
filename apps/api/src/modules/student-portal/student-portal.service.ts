import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { EnrollmentStatus, LessonStatus, SubmissionStatus } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../database/prisma.service';
import { notFound } from '../../common/http-errors';
import { SupabaseStorageService } from '../../storage/supabase-storage.service';
import type { AuthPayload } from '../auth/auth.types';
import { ScheduleQueryDto } from './dto/schedule-query.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';

const MAX_FILES_PER_SUBMISSION = 5;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

@Injectable()
export class StudentPortalService {
  constructor(private readonly prisma: PrismaService, private readonly storage: SupabaseStorageService) {}

  async getProfile(user: AuthPayload) {
    const student = await this.getStudent(user);
    return { id: student.id.toString(), code: student.studentCode, fullName: student.user.fullName, email: student.user.email, gender: student.gender, dateOfBirth: student.dateOfBirth, currentLevel: student.currentLevel, targetLevel: student.targetLevel, status: student.user.status };
  }

  async getClasses(user: AuthPayload) {
    const student = await this.getStudent(user);
    const enrollments = await this.prisma.enrollment.findMany({ where: { studentId: student.id, status: EnrollmentStatus.ACTIVE }, include: { class: { include: { course: true, teacher: { include: { user: true } }, _count: { select: { enrollments: true, lessons: true } } } } }, orderBy: { enrolledAt: 'desc' } });
    return { data: enrollments.map((item) => this.classResponse(item.class, item.status)) };
  }

  async getClass(classId: string, user: AuthPayload) {
    const student = await this.getStudent(user);
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { studentId_classId: { studentId: student.id, classId: BigInt(classId) } },
      include: {
        class: {
          include: {
            course: true,
            teacher: { include: { user: true } },
            _count: { select: { enrollments: true, lessons: true } },
            lessons: { orderBy: { lessonDate: 'asc' } },
            tests: { orderBy: { testDate: 'desc' } },
            assignments: { orderBy: { dueAt: 'asc' }, include: { submissions: { where: { studentId: student.id }, include: { files: true } } } },
          },
        },
      },
    });
    if (!enrollment || enrollment.status !== EnrollmentStatus.ACTIVE) throw new ForbiddenException('You are not enrolled in this class');
    return { ...this.classResponse(enrollment.class, enrollment.status), lessons: enrollment.class.lessons.map((lesson) => this.lessonResponse(lesson)), tests: enrollment.class.tests.map((test) => ({ id: test.id.toString(), name: test.name, type: test.type, testDate: test.testDate, maxScore: Number(test.maxScore) })), assignments: await Promise.all(enrollment.class.assignments.map((assignment) => this.assignmentResponse(assignment))) };
  }

  async getAssignments(classId: string, user: AuthPayload) {
    const detail = await this.getClass(classId, user);
    return { data: detail.assignments };
  }

  async submitAssignment(assignmentId: string, files: Express.Multer.File[], dto: SubmitAssignmentDto, user: AuthPayload) {
    const student = await this.getStudent(user);
    this.validateFiles(files);
    const assignment = await this.prisma.assignment.findUnique({ where: { id: BigInt(assignmentId) }, include: { class: { select: { id: true } }, submissions: { where: { studentId: student.id }, include: { files: true } } } });
    if (!assignment) notFound('Assignment', assignmentId);
    const enrollment = await this.prisma.enrollment.findUnique({ where: { studentId_classId: { studentId: student.id, classId: assignment.class.id } } });
    if (!enrollment || enrollment.status !== EnrollmentStatus.ACTIVE) throw new ForbiddenException('You are not enrolled in this class');

    const uploadedPaths: string[] = [];
    const oldPaths = assignment.submissions[0]?.files.map((file) => file.storagePath) ?? [];
    const fileMetadata = files.map((file) => {
      const storagePath = `${student.id.toString()}/${assignment.id.toString()}/${randomUUID()}-${this.safeFileName(file.originalname)}`;
      uploadedPaths.push(storagePath);
      return { storagePath, fileName: file.originalname.slice(0, 255), mimeType: file.mimetype, sizeBytes: file.size };
    });
    const submittedAt = new Date();
    const status = submittedAt > assignment.dueAt ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED;

    try {
      for (const [index, file] of files.entries()) await this.storage.upload(fileMetadata[index].storagePath, file);
      await this.prisma.assignmentSubmission.upsert({
        where: { assignmentId_studentId: { assignmentId: assignment.id, studentId: student.id } },
        update: { note: dto.note?.trim() || null, status, submittedAt, files: { deleteMany: {}, create: fileMetadata } },
        create: { assignmentId: assignment.id, studentId: student.id, note: dto.note?.trim() || null, status, submittedAt, files: { create: fileMetadata } },
      });
      if (oldPaths.length) {
        try { await this.storage.remove(oldPaths); } catch { /* Keep the submission valid if old storage cleanup is temporarily unavailable. */ }
      }
    } catch (error) {
      if (uploadedPaths.length) {
        try { await this.storage.remove(uploadedPaths); } catch { /* Do not hide the original upload error. */ }
      }
      throw error;
    }

    const saved = await this.prisma.assignment.findUnique({ where: { id: assignment.id }, include: { submissions: { where: { studentId: student.id }, include: { files: true } } } });
    return { data: await this.assignmentResponse(saved!) };
  }

  async getSchedule(query: ScheduleQueryDto, user: AuthPayload) {
    const student = await this.getStudent(user);
    const lessons = await this.prisma.lesson.findMany({ where: { status: { not: LessonStatus.CANCELLED }, class: { enrollments: { some: { studentId: student.id, status: EnrollmentStatus.ACTIVE } } }, ...(query.fromDate || query.toDate ? { lessonDate: { ...(query.fromDate ? { gte: this.date(query.fromDate) } : {}), ...(query.toDate ? { lte: this.date(query.toDate) } : {}) } } : {}) }, include: { class: true }, orderBy: [{ lessonDate: 'asc' }, { startTime: 'asc' }] });
    return { data: lessons.map((lesson) => this.lessonResponse(lesson)) };
  }

  async getAttendance(user: AuthPayload) {
    const student = await this.getStudent(user);
    const entries = await this.prisma.attendance.findMany({ where: { studentId: student.id }, include: { lesson: { include: { class: true } } }, orderBy: { lesson: { lessonDate: 'desc' } } });
    const summary = { present: entries.filter((item) => item.status === 'PRESENT').length, absent: entries.filter((item) => item.status === 'ABSENT').length, late: entries.filter((item) => item.status === 'LATE').length };
    return { summary: { ...summary, total: entries.length, participationRate: entries.length ? Math.round(((summary.present + summary.late) / entries.length) * 100) : 0 }, data: entries.map((item) => ({ id: item.id.toString(), lessonId: item.lessonId.toString(), classCode: item.lesson.class.code, lessonTitle: item.lesson.title, lessonDate: item.lesson.lessonDate, status: item.status, note: item.note })) };
  }

  async getScores(user: AuthPayload) {
    const student = await this.getStudent(user);
    const scores = await this.prisma.score.findMany({ where: { studentId: student.id }, include: { test: { include: { class: true } } }, orderBy: { test: { testDate: 'desc' } } });
    const average = scores.length ? Number((scores.reduce((sum, item) => sum + Number(item.value), 0) / scores.length).toFixed(1)) : 0;
    return { summary: { average, highest: scores.length ? Math.max(...scores.map((item) => Number(item.value))) : 0, completedTests: scores.length }, data: scores.map((item) => ({ id: item.id.toString(), testId: item.testId.toString(), title: item.test.name, classCode: item.test.class.code, value: Number(item.value), maxScore: Number(item.test.maxScore), date: item.test.testDate, note: item.note })) };
  }

  async getProgress(user: AuthPayload) {
    const student = await this.getStudent(user);
    const [enrollments, lessons, attendance, scores] = await this.prisma.$transaction([this.prisma.enrollment.findMany({ where: { studentId: student.id, status: EnrollmentStatus.ACTIVE }, include: { class: { include: { course: true } } } }), this.prisma.lesson.count({ where: { class: { enrollments: { some: { studentId: student.id, status: EnrollmentStatus.ACTIVE } } }, status: LessonStatus.COMPLETED } }), this.prisma.attendance.findMany({ where: { studentId: student.id } }), this.prisma.score.findMany({ where: { studentId: student.id } })]);
    const present = attendance.filter((item) => item.status === 'PRESENT').length;
    const averageScore = scores.length ? Number((scores.reduce((sum, item) => sum + Number(item.value), 0) / scores.length).toFixed(1)) : 0;
    const totalLessons = enrollments.reduce((sum, item) => sum + item.class.course.totalLessons, 0);
    return { currentLevel: student.currentLevel, targetLevel: student.targetLevel, attendanceRate: attendance.length ? Math.round((present / attendance.length) * 100) : 0, averageScore, completedLessons: lessons, totalLessons };
  }

  private async getStudent(user: AuthPayload) {
    const student = await this.prisma.student.findUnique({ where: { userId: BigInt(user.sub) }, include: { user: true } });
    if (!student) notFound('Student profile', user.sub);
    return student;
  }

  private classResponse(item: any, enrollmentStatus: EnrollmentStatus) {
    return { id: item.id.toString(), code: item.code, name: item.name, courseName: item.course.name, level: item.course.level, teacherName: item.teacher.user.fullName, teacherInitials: item.teacher.user.fullName.split(' ').slice(-2).map((part: string) => part[0]).join(''), schedule: item.schedule, room: item.room, studentCount: item._count?.enrollments ?? 0, capacity: item.capacity, lessonCount: item._count?.lessons ?? 0, status: item.status, enrollmentStatus };
  }

  private lessonResponse(item: any) {
    return { id: item.id.toString(), classId: item.classId.toString(), classCode: item.class?.code, className: item.class?.name, title: item.title, lessonDate: item.lessonDate, startTime: this.time(item.startTime), endTime: this.time(item.endTime), content: item.content, recordUrl: item.recordUrl, status: item.status };
  }

  private async assignmentResponse(assignment: any) {
    const submission = assignment.submissions?.[0] ?? null;
    const files = submission ? await Promise.all(submission.files.map(async (file: any) => ({ id: file.id.toString(), fileName: file.fileName, mimeType: file.mimeType, sizeBytes: file.sizeBytes, downloadUrl: await this.storage.createSignedUrl(file.storagePath) }))) : [];
    return { id: assignment.id.toString(), title: assignment.title, description: assignment.description, dueAt: assignment.dueAt, status: submission?.status ?? (assignment.dueAt < new Date() ? 'OVERDUE' : 'PENDING'), submission: submission ? { id: submission.id.toString(), note: submission.note, status: submission.status, submittedAt: submission.submittedAt, files } : null };
  }

  private validateFiles(files: Express.Multer.File[]) {
    if (!files.length) throw new BadRequestException('At least one document or image is required');
    if (files.length > MAX_FILES_PER_SUBMISSION) throw new BadRequestException(`You can submit up to ${MAX_FILES_PER_SUBMISSION} files`);
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE_BYTES) throw new BadRequestException(`${file.originalname} exceeds the 10 MB limit`);
      if (!ALLOWED_FILE_TYPES.has(file.mimetype)) throw new BadRequestException(`${file.originalname} has an unsupported file type`);
    }
  }

  private safeFileName(value: string) {
    return value.normalize('NFKD').replace(/[^\w.-]+/g, '-').replace(/-+/g, '-').slice(0, 180);
  }

  private date(value: string) { return new Date(`${value.slice(0, 10)}T00:00:00.000Z`); }
  private time(value: Date) { return value.toISOString().slice(11, 16); }
}
