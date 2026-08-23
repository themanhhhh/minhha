import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma, UserRole, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../../database/prisma.service';
import { normalizePagination, paginationMeta } from '../../common/pagination';
import { notFound } from '../../common/http-errors';
import { CreateStudentDto } from './dto/create-student.dto';
import { ListStudentDto } from './dto/list-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListStudentDto) {
    const pagination = normalizePagination(query);
    const where: Prisma.StudentWhereInput = { ...(query.level ? { currentLevel: query.level } : {}), user: { ...(query.status ? { status: query.status } : {}), ...(query.search ? { OR: [{ fullName: { contains: query.search, mode: 'insensitive' } }, { email: { contains: query.search, mode: 'insensitive' } }] } : {}) } };
    const [students, total] = await this.prisma.$transaction([this.prisma.student.findMany({ where, include: { user: true, enrollments: { where: { status: 'ACTIVE' }, include: { class: true } }, attendance: true, scores: true }, orderBy: { createdAt: 'desc' }, skip: pagination.skip, take: pagination.take }), this.prisma.student.count({ where })]);
    return { data: students.map((student) => this.toResponse(student)), meta: paginationMeta(pagination.page, pagination.pageSize, total) };
  }

  async findOne(id: string) {
    const student = await this.prisma.student.findUnique({ where: { id: BigInt(id) }, include: { user: true, enrollments: { include: { class: { include: { course: true, teacher: { include: { user: true } } } } } }, attendance: true, scores: true } });
    if (!student) notFound('Student', id);
    return this.toResponse(student);
  }

  async create(dto: CreateStudentDto) {
    const password = dto.password ?? randomBytes(12).toString('base64url');
    try {
      const result = await this.prisma.$transaction(async (tx) => { const user = await tx.user.create({ data: { email: dto.email.toLowerCase(), fullName: dto.fullName, passwordHash: await argon2.hash(password), role: UserRole.STUDENT, status: UserStatus.ACTIVE } }); return tx.student.create({ data: { userId: user.id, studentCode: dto.studentCode, gender: dto.gender, dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined, currentLevel: dto.currentLevel, targetLevel: dto.targetLevel }, include: { user: true, enrollments: true, attendance: true, scores: true } }); });
      return { data: this.toResponse(result), temporaryPassword: dto.password ? undefined : password };
    } catch (error) { if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('Email or student code already exists'); throw error; }
  }

  async update(id: string, dto: UpdateStudentDto) {
    const student = await this.prisma.student.findUnique({ where: { id: BigInt(id) } });
    if (!student) notFound('Student', id);
    const result = await this.prisma.$transaction(async (tx) => { const userData = { ...(dto.email ? { email: dto.email.toLowerCase() } : {}), ...(dto.fullName ? { fullName: dto.fullName } : {}) }; if (Object.keys(userData).length) await tx.user.update({ where: { id: student.userId }, data: userData }); return tx.student.update({ where: { id: BigInt(id) }, data: { ...(dto.studentCode ? { studentCode: dto.studentCode } : {}), ...(dto.gender !== undefined ? { gender: dto.gender } : {}), ...(dto.dateOfBirth ? { dateOfBirth: new Date(dto.dateOfBirth) } : {}), ...(dto.currentLevel ? { currentLevel: dto.currentLevel } : {}), ...(dto.targetLevel ? { targetLevel: dto.targetLevel } : {}) }, include: { user: true, enrollments: { where: { status: 'ACTIVE' }, include: { class: true } }, attendance: true, scores: true } }); });
    return this.toResponse(result);
  }

  private toResponse(student: any) { const attendanceTotal = student.attendance?.length ?? 0; const present = student.attendance?.filter((entry: any) => entry.status === 'PRESENT').length ?? 0; const averageScore = student.scores?.length ? Number((student.scores.reduce((sum: number, score: any) => sum + Number(score.value), 0) / student.scores.length).toFixed(1)) : 0; return { id: student.id.toString(), code: student.studentCode, fullName: student.user.fullName, email: student.user.email, gender: student.gender, dateOfBirth: student.dateOfBirth, currentLevel: student.currentLevel, targetLevel: student.targetLevel, className: student.enrollments?.[0]?.class?.code ?? null, status: student.user.status, attendanceRate: attendanceTotal ? Math.round((present / attendanceTotal) * 100) : 0, averageScore }; }
}
