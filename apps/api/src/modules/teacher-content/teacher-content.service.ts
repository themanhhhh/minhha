import { BadRequestException, Injectable } from '@nestjs/common';
import { ClassStatus, EnrollmentStatus, LessonStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { SupabaseStorageService } from '../../storage/supabase-storage.service';
import { notFound } from '../../common/http-errors';
import { TeachingAccessService } from '../teaching/teaching-access.service';
import type { AuthPayload } from '../auth/auth.types';
import { CreateTeacherAssignmentDto } from './dto/create-assignment.dto';
import { CreateClassMaterialDto } from './dto/create-material.dto';
import { randomUUID } from 'node:crypto';

const MAX_ASSIGNMENT_FILES = 5;
const MAX_ASSIGNMENT_FILE_SIZE = 10 * 1024 * 1024;
const MAX_MATERIAL_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'audio/mpeg',
  'video/mp4',
]);

@Injectable()
export class TeacherContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: SupabaseStorageService,
    private readonly access: TeachingAccessService,
  ) {}

  async getTeacherClasses(user: AuthPayload) {
    const classes = await this.prisma.class.findMany({
      where: {
        status: { not: ClassStatus.CANCELLED },
        ...(user.role === UserRole.TEACHER ? { teacher: { userId: BigInt(user.sub) } } : {}),
      },
      include: {
        course: true,
        _count: { select: { enrollments: true } },
        lessons: { orderBy: [{ lessonDate: 'asc' }, { startTime: 'asc' }] },
      },
      orderBy: { startDate: 'desc' },
    });

    return { data: classes.map((classRoom) => this.teacherClassResponse(classRoom)) };
  }

  async getTeacherClass(classId: string, user: AuthPayload) {
    await this.access.assertClass(classId, user, false);
    const classRoom = await this.prisma.class.findUnique({ where: { id: BigInt(classId) }, include: { course: true, _count: { select: { enrollments: true } }, lessons: { orderBy: [{ lessonDate: 'asc' }, { startTime: 'asc' }] } } });
    if (!classRoom) notFound('Class', classId);
    return { data: this.teacherClassResponse(classRoom) };
  }

  async getClassStudents(classId: string, user: AuthPayload) {
    await this.access.assertClass(classId, user, false);
    const enrollments = await this.prisma.enrollment.findMany({
      where: { classId: BigInt(classId), status: { in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] } },
      include: { student: { include: { user: true, attendance: { where: { lesson: { classId: BigInt(classId) } }, orderBy: { lesson: { lessonDate: 'desc' } }, take: 1 }, scores: { where: { test: { classId: BigInt(classId) } }, orderBy: { test: { testDate: 'desc' } }, take: 1 } } } },
      orderBy: { student: { studentCode: 'asc' } },
    });
    return { data: enrollments.map((enrollment) => { const student = enrollment.student; return { id: student.id.toString(), code: student.studentCode, fullName: student.user.fullName, email: student.user.email, attendanceStatus: student.attendance[0]?.status ?? null, latestScore: student.scores[0] ? Number(student.scores[0].value) : null }; }) };
  }

  async getClassContent(classId: string, user: AuthPayload) {
    await this.access.assertClass(classId, user, false);
    const [assignments, materials] = await Promise.all([
      this.prisma.assignment.findMany({
        where: { classId: BigInt(classId) },
        include: { attachments: true, _count: { select: { submissions: true } } },
        orderBy: { dueAt: 'asc' },
      }),
      this.prisma.classMaterial.findMany({
        where: { classId: BigInt(classId) },
        include: { lesson: { select: { id: true, title: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: {
        assignments: await Promise.all(assignments.map((assignment) => this.assignmentResponse(assignment))),
        materials: await Promise.all(materials.map((material) => this.materialResponse(material))),
      },
    };
  }

  async createAssignment(classId: string, files: Express.Multer.File[], dto: CreateTeacherAssignmentDto, user: AuthPayload) {
    await this.access.assertClass(classId, user, true);
    this.validateFiles(files, MAX_ASSIGNMENT_FILES, MAX_ASSIGNMENT_FILE_SIZE);
    const dueAt = new Date(dto.dueAt);
    if (Number.isNaN(dueAt.getTime())) throw new BadRequestException('dueAt must be a valid date');

    const assignment = await this.prisma.assignment.create({
      data: { classId: BigInt(classId), title: dto.title.trim(), description: dto.description?.trim() || null, dueAt },
    });
    const paths = files.map((file) => `assignments/${classId}/${assignment.id.toString()}/${randomUUID()}-${this.safeFileName(file.originalname)}`);

    try {
      for (const [index, file] of files.entries()) await this.storage.upload(paths[index], file);
      if (files.length) {
        await this.prisma.assignmentAttachment.createMany({
          data: files.map((file, index) => ({ assignmentId: assignment.id, storagePath: paths[index], fileName: file.originalname.slice(0, 255), mimeType: file.mimetype, sizeBytes: file.size })),
        });
      }
    } catch (error) {
      if (paths.length) {
        try { await this.storage.remove(paths); } catch { /* Preserve the original failure. */ }
      }
      await this.prisma.assignment.delete({ where: { id: assignment.id } });
      throw error;
    }

    const saved = await this.prisma.assignment.findUnique({ where: { id: assignment.id }, include: { attachments: true, _count: { select: { submissions: true } } } });
    return { data: await this.assignmentResponse(saved!) };
  }

  async createMaterial(classId: string, files: Express.Multer.File[], dto: CreateClassMaterialDto, user: AuthPayload) {
    await this.access.assertClass(classId, user, true);
    this.validateFiles(files, 1, MAX_MATERIAL_FILE_SIZE);
    const file = files[0];
    if (!file) throw new BadRequestException('A lecture material file is required');

    let lessonId: bigint | null = null;
    if (dto.lessonId) {
      const lesson = await this.prisma.lesson.findUnique({ where: { id: BigInt(dto.lessonId) }, select: { id: true, classId: true } });
      if (!lesson || lesson.classId !== BigInt(classId)) throw new BadRequestException('The selected lesson does not belong to this class');
      lessonId = lesson.id;
    }

    const storagePath = `materials/${classId}/${randomUUID()}-${this.safeFileName(file.originalname)}`;
    try {
      await this.storage.upload(storagePath, file);
      const material = await this.prisma.classMaterial.create({
        data: { classId: BigInt(classId), lessonId, createdBy: BigInt(user.sub), title: dto.title.trim(), description: dto.description?.trim() || null, storagePath, fileName: file.originalname.slice(0, 255), mimeType: file.mimetype, sizeBytes: file.size },
        include: { lesson: { select: { id: true, title: true } } },
      });
      return { data: await this.materialResponse(material) };
    } catch (error) {
      try { await this.storage.remove([storagePath]); } catch { /* Preserve the original failure. */ }
      throw error;
    }
  }

  async deleteAssignment(assignmentId: string, user: AuthPayload) {
    const assignment = await this.prisma.assignment.findUnique({ where: { id: BigInt(assignmentId) }, include: { attachments: true, submissions: { include: { files: true } } } });
    if (!assignment) notFound('Assignment', assignmentId);
    await this.access.assertClass(assignment.classId.toString(), user, true);
    const paths = [...assignment.attachments.map((attachment) => attachment.storagePath), ...assignment.submissions.flatMap((submission) => submission.files.map((file) => file.storagePath))];
    if (paths.length) await this.storage.remove(paths);
    await this.prisma.assignment.delete({ where: { id: assignment.id } });
    return { data: { id: assignment.id.toString() } };
  }

  async deleteMaterial(materialId: string, user: AuthPayload) {
    const material = await this.prisma.classMaterial.findUnique({ where: { id: BigInt(materialId) } });
    if (!material) notFound('Class material', materialId);
    await this.access.assertClass(material.classId.toString(), user, true);
    await this.storage.remove([material.storagePath]);
    await this.prisma.classMaterial.delete({ where: { id: material.id } });
    return { data: { id: material.id.toString() } };
  }

  private async assignmentResponse(assignment: any) {
    return {
      id: assignment.id.toString(),
      title: assignment.title,
      description: assignment.description,
      dueAt: assignment.dueAt,
      submissionCount: assignment._count?.submissions ?? 0,
      attachments: await Promise.all((assignment.attachments ?? []).map((file: any) => this.fileResponse(file))),
    };
  }

  private teacherClassResponse(classRoom: any) {
    const completedLessons = classRoom.lessons.filter((lesson: any) => lesson.status === LessonStatus.COMPLETED).length;
    const nextLesson = classRoom.lessons.find((lesson: any) => lesson.status !== LessonStatus.CANCELLED && lesson.lessonDate >= new Date());
    const status = classRoom.status === ClassStatus.COMPLETED ? 'COMPLETED' : classRoom.status === ClassStatus.UPCOMING ? 'UPCOMING' : 'ACTIVE';
    return {
      id: classRoom.id.toString(),
      code: classRoom.code,
      name: classRoom.name,
      section: classRoom.course.name,
      schedule: classRoom.schedule,
      room: classRoom.room ?? 'Chưa xếp phòng',
      studentCount: classRoom._count.enrollments,
      capacity: classRoom.capacity,
      completedLessons,
      totalLessons: classRoom.course.totalLessons,
      nextLesson: nextLesson ? `${nextLesson.lessonDate.toISOString().slice(0, 10)} · ${nextLesson.startTime.toISOString().slice(11, 16)}` : 'Đã hoàn thành',
      nextLessonTitle: nextLesson?.title ?? 'Khóa học đã hoàn thành',
      attendancePending: false,
      pendingScores: 0,
      status,
      theme: 'emerald',
    };
  }

  private async materialResponse(material: any) {
    const file = await this.fileResponse(material);
    return {
      id: material.id.toString(),
      title: material.title,
      description: material.description,
      lessonId: material.lesson?.id?.toString() ?? null,
      lessonTitle: material.lesson?.title ?? null,
      fileName: file.fileName,
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
      downloadUrl: file.downloadUrl,
    };
  }

  private async fileResponse(file: { id: bigint; fileName: string; mimeType: string; sizeBytes: number; storagePath: string }) {
    return { id: file.id.toString(), fileName: file.fileName, mimeType: file.mimeType, sizeBytes: file.sizeBytes, downloadUrl: await this.storage.createSignedUrl(file.storagePath) };
  }

  private validateFiles(files: Express.Multer.File[], maxFiles: number, maxSize: number) {
    if (files.length > maxFiles) throw new BadRequestException(`You can upload up to ${maxFiles} files`);
    for (const file of files) {
      if (file.size > maxSize) throw new BadRequestException(`${file.originalname} exceeds the file size limit`);
      if (!ALLOWED_FILE_TYPES.has(file.mimetype)) throw new BadRequestException(`${file.originalname} has an unsupported file type`);
    }
  }

  private safeFileName(value: string) {
    return value.normalize('NFKD').replace(/[^\w.-]+/g, '-').replace(/-+/g, '-').slice(0, 180);
  }
}
