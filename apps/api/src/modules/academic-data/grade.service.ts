import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { summarizeGrades } from '../../common/grade-summary';

@Injectable()
export class GradeService {
  constructor(private readonly prisma: PrismaService) {}
  async summarize(where: Prisma.TestWhereInput = {}, studentId?: bigint) {
    const [tests, weights] = await Promise.all([
      this.prisma.test.findMany({ where, select: { id: true, classId: true, type: true, maxScore: true, scores: { where: studentId === undefined ? {} : { studentId }, select: { studentId: true, value: true } } } }),
      this.prisma.testTypeDefinition.findMany({ select: { code: true, weight: true } }),
    ]);
    return summarizeGrades(tests, weights, studentId);
  }
  async forStudents(students: { id: bigint; enrollments: { classId: bigint }[] }[]) {
    const classIds = [...new Set(students.flatMap(s => s.enrollments.map(e => e.classId)))];
    const [tests, weights] = await Promise.all([
      this.prisma.test.findMany({ where: { classId: { in: classIds } }, select: { id: true, classId: true, type: true, maxScore: true, scores: { where: { studentId: { in: students.map(s => s.id) } }, select: { studentId: true, value: true } } } }),
      this.prisma.testTypeDefinition.findMany({ select: { code: true, weight: true } }),
    ]);
    return new Map(students.map(student => {
      const enrolled = new Set(student.enrollments.map(e => e.classId));
      return [String(student.id), summarizeGrades(tests.filter(t => enrolled.has(t.classId)), weights, student.id)];
    }));
  }
}
