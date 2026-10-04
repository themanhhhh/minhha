import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma, UserRole, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../../database/prisma.service';
import { normalizePagination, paginationMeta } from '../../common/pagination';
import { notFound } from '../../common/http-errors';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { ListTeacherDto } from './dto/list-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import type { AuthPayload } from '../auth/auth.types';

@Injectable()
export class TeachersService {
  constructor(private readonly prisma: PrismaService) {}
  async getCurrent(user: AuthPayload) { const teacher = await this.prisma.teacher.findUnique({ where: { userId: BigInt(user.sub) }, include: { user: true, _count: { select: { classes: true } } } }); if (!teacher) notFound('Teacher profile', user.sub); return { id: teacher.id.toString(), code: teacher.teacherCode, fullName: teacher.user.fullName, gender: null, dateOfBirth: null, email: teacher.user.email, phone: teacher.phone, jlptLevel: teacher.jlptLevel, specialty: null, experienceYears: null, classCount: teacher._count.classes, status: teacher.user.status }; }
  async findAll(query: ListTeacherDto) { const pagination = normalizePagination(query); const where: Prisma.TeacherWhereInput = { user: { ...(query.status ? { status: query.status } : {}), ...(query.search ? { OR: [{ fullName: { contains: query.search, mode: 'insensitive' } }, { email: { contains: query.search, mode: 'insensitive' } }] } : {}) } }; const [teachers, total] = await this.prisma.$transaction([this.prisma.teacher.findMany({ where, include: { user: true, _count: { select: { classes: true } } }, orderBy: { createdAt: 'desc' }, skip: pagination.skip, take: pagination.take }), this.prisma.teacher.count({ where })]); return { data: teachers.map(this.toResponse), meta: paginationMeta(pagination.page, pagination.pageSize, total) }; }
  async findOne(id: string) { const teacher = await this.prisma.teacher.findUnique({ where: { id: BigInt(id) }, include: { user: true, classes: { include: { course: true } } } }); if (!teacher) notFound('Teacher', id); return { ...this.toResponse(teacher), classes: teacher.classes.map((item) => ({ id: item.id.toString(), code: item.code, name: item.name, course: item.course.name })) }; }
  async create(dto: CreateTeacherDto) { const password = dto.password ?? randomBytes(12).toString('base64url'); try { const teacher = await this.prisma.$transaction(async (tx) => { const user = await tx.user.create({ data: { email: dto.email.toLowerCase(), fullName: dto.fullName, passwordHash: await argon2.hash(password), role: UserRole.TEACHER, status: UserStatus.ACTIVE } }); return tx.teacher.create({ data: { userId: user.id, teacherCode: dto.teacherCode, phone: dto.phone, jlptLevel: dto.jlptLevel }, include: { user: true, _count: { select: { classes: true } } } }); }); return { data: this.toResponse(teacher), temporaryPassword: dto.password ? undefined : password }; } catch (error) { if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('Email or teacher code already exists'); throw error; } }
  async update(id: string, dto: UpdateTeacherDto) { const teacher = await this.prisma.teacher.findUnique({ where: { id: BigInt(id) } }); if (!teacher) notFound('Teacher', id); const result = await this.prisma.$transaction(async (tx) => { if (dto.email || dto.fullName) await tx.user.update({ where: { id: teacher.userId }, data: { ...(dto.email ? { email: dto.email.toLowerCase() } : {}), ...(dto.fullName ? { fullName: dto.fullName } : {}) } }); return tx.teacher.update({ where: { id: BigInt(id) }, data: { ...(dto.teacherCode ? { teacherCode: dto.teacherCode } : {}), ...(dto.phone !== undefined ? { phone: dto.phone } : {}), ...(dto.jlptLevel ? { jlptLevel: dto.jlptLevel } : {}) }, include: { user: true, _count: { select: { classes: true } } } }); }); return this.toResponse(result); }
  private toResponse(teacher: any) { return { id: teacher.id.toString(), code: teacher.teacherCode, fullName: teacher.user.fullName, email: teacher.user.email, phone: teacher.phone, jlptLevel: teacher.jlptLevel, classCount: teacher._count?.classes ?? 0, status: teacher.user.status }; }
}
