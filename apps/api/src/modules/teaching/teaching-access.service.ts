import { ForbiddenException, Injectable } from '@nestjs/common';
import { EnrollmentStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { notFound } from '../../common/http-errors';
import type { AuthPayload } from '../auth/auth.types';

@Injectable()
export class TeachingAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async assertClass(classId: string, user: AuthPayload, write: boolean) {
    const classRoom = await this.prisma.class.findUnique({ where: { id: BigInt(classId) } });
    if (!classRoom) notFound('Class', classId);
    if (user.role === UserRole.ACADEMIC_STAFF) return classRoom;
    if (user.role === UserRole.DIRECTOR && !write) return classRoom;
    if (user.role === UserRole.TEACHER) {
      const teacher = await this.prisma.teacher.findUnique({ where: { userId: BigInt(user.sub) } });
      if (!teacher || teacher.id !== classRoom.teacherId) throw new ForbiddenException('You do not manage this class');
      return classRoom;
    }
    if (user.role === UserRole.STUDENT && !write) {
      const student = await this.prisma.student.findUnique({ where: { userId: BigInt(user.sub) } });
      const enrollment = student ? await this.prisma.enrollment.findUnique({ where: { studentId_classId: { studentId: student.id, classId: BigInt(classId) } } }) : null;
      if (!enrollment || enrollment.status !== EnrollmentStatus.ACTIVE) throw new ForbiddenException('You are not enrolled in this class');
      return classRoom;
    }
    throw new ForbiddenException('You do not have access to this class');
  }

  async assertLesson(lessonId: string, user: AuthPayload, write: boolean) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id: BigInt(lessonId) } });
    if (!lesson) notFound('Lesson', lessonId);
    await this.assertClass(lesson.classId.toString(), user, write);
    return lesson;
  }

  async assertTest(testId: string, user: AuthPayload, write: boolean) {
    const test = await this.prisma.test.findUnique({ where: { id: BigInt(testId) } });
    if (!test) notFound('Test', testId);
    await this.assertClass(test.classId.toString(), user, write);
    return test;
  }
}
