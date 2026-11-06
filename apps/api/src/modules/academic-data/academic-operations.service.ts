import { BadRequestException, ConflictException, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { addCalendarMonths, localToday } from '../../common/academic-rules';
import type { AuthPayload } from '../auth/auth.types';
import { ReservationDto, TransferDto, UpdateWeightsDto } from './academic-data.dto';

const transactionOptions = { maxWait: 10_000, timeout: 30_000 };
@Injectable()
export class AcademicOperationsService implements OnModuleInit, OnModuleDestroy {
  private timer?: ReturnType<typeof setInterval>;
  private readonly logger = new Logger(AcademicOperationsService.name);
  constructor(private readonly prisma: PrismaService) {}
  onModuleInit() {
    this.timer = setInterval(() => { void this.expire().catch(() => this.logger.error('Reservation expiry failed; will retry on the next interval')); }, 60_000);
    this.timer.unref();
  }
  onModuleDestroy() { if (this.timer) clearInterval(this.timer); }
  async lookups() {
    const [roles, statuses, levels, attendance, testTypes] = await Promise.all([
      this.prisma.roleDefinition.findMany({ orderBy: { id: 'asc' } }), this.prisma.userStatusDefinition.findMany({ orderBy: { id: 'asc' } }),
      this.prisma.jlptDefinition.findMany({ orderBy: { id: 'asc' } }), this.prisma.attendanceDefinition.findMany({ orderBy: { id: 'asc' } }), this.prisma.testTypeDefinition.findMany({ orderBy: { id: 'asc' } }),
    ]);
    return { roles, statuses, levels, attendance, testTypes };
  }
  async updateWeights(dto: UpdateWeightsDto, actor: AuthPayload) {
    if (new Set(dto.entries.map(e => e.code)).size !== 4 || Math.abs(dto.entries.reduce((s, e) => s + e.weight, 0) - 100) > 0.000001) throw new BadRequestException('Provide all four types with unique codes and a total weight of 100%');
    await this.prisma.$transaction(async tx => {
      // Serializes edits and keeps audit evidence with the configuration update.
      await tx.$queryRaw`SELECT ma_loai_bai_kiem_tra FROM "LoaiBaiKiemTra" ORDER BY ma_loai_bai_kiem_tra FOR UPDATE`;
      const previous = await tx.testTypeDefinition.findMany();
      for (const entry of dto.entries) await tx.testTypeDefinition.update({ where: { code: entry.code }, data: { weight: entry.weight } });
      await tx.auditLog.create({ data: { actorId: BigInt(actor.sub), action: 'UPDATE_WEIGHTS', entity: 'TestTypeDefinition', oldValue: previous, newValue: dto.entries.map(e => ({ code: e.code, weight: e.weight })) } });
    }, transactionOptions);
    return this.lookups();
  }
  async history(studentId?: string) {
    if (studentId && !/^\d+$/.test(studentId)) throw new BadRequestException('Invalid student ID');
    const where = studentId ? { studentId: BigInt(studentId) } : {};
    const [reservations, transfers] = await Promise.all([
      this.prisma.studyReservation.findMany({ where, orderBy: { id: 'desc' }, take: 100, include: { student: { include: { user: { select: { fullName: true } } } }, class: { select: { code: true } } } }),
      this.prisma.classTransfer.findMany({ where, orderBy: { id: 'desc' }, take: 100, include: { student: { include: { user: { select: { fullName: true } } } }, fromClass: { select: { code: true } }, toClass: { select: { code: true } } } }),
    ]);
    return { reservations: reservations.map(r => ({ id: String(r.id), studentId: String(r.studentId), studentName: r.student.user.fullName, classCode: r.class.code, startDate: r.startDate, endDate: r.endDate, durationMonths: r.durationMonths, isActive: r.isActive, status: r.status, reason: r.reason })), transfers: transfers.map(t => ({ id: String(t.id), studentId: String(t.studentId), studentName: t.student.user.fullName, fromClass: t.fromClass?.code, toClass: t.toClass.code, transferredOn: t.transferredOn, reason: t.reason, status: t.status })) };
  }
  private async lock(tx: Prisma.TransactionClient, ids: bigint[]) {
    await tx.$queryRaw(Prisma.sql`SELECT ma_lop_hoc FROM "LopHoc" WHERE ma_lop_hoc IN (${Prisma.join(ids)}) ORDER BY ma_lop_hoc FOR UPDATE`);
  }
  async transfer(dto: TransferDto, actor: AuthPayload) {
    if (dto.fromClassId === dto.toClassId) throw new BadRequestException('Source and destination classes must differ');
    const studentId = BigInt(dto.studentId), fromClassId = BigInt(dto.fromClassId), toClassId = BigInt(dto.toClassId);
    const id = await this.prisma.$transaction(async tx => {
      await this.lock(tx, [fromClassId, toClassId]);
      const source = await tx.enrollment.findUnique({ where: { studentId_classId: { studentId, classId: fromClassId } }, include: { class: { include: { course: true } } } });
      const target = await tx.class.findUnique({ where: { id: toClassId }, include: { course: true } });
      if (!source || source.status !== 'ACTIVE') throw new ConflictException('Student must be actively enrolled in source class');
      if (!target || !['ACTIVE', 'UPCOMING'].includes(target.status) || target.studentCount >= target.capacity) throw new ConflictException('Destination class is unavailable or full');
      if (target.course.level !== source.class.course.level) throw new BadRequestException('Transfer requires the same JLPT level');
      const existing = await tx.enrollment.findUnique({ where: { studentId_classId: { studentId, classId: toClassId } } });
      if (existing && ['ACTIVE', 'RESERVED'].includes(existing.status)) throw new ConflictException('Student already participates in destination class');
      await tx.enrollment.update({ where: { id: source.id }, data: { status: 'CANCELLED', leftAt: new Date() } });
      await tx.enrollment.upsert({ where: { studentId_classId: { studentId, classId: toClassId } }, create: { studentId, classId: toClassId }, update: { status: 'ACTIVE', enrolledAt: new Date(), leftAt: null } });
      const transfer = await tx.classTransfer.create({ data: { studentId, fromClassId, toClassId, reason: dto.reason, status: 'APPROVED', transferredOn: localToday() } });
      await tx.auditLog.create({ data: { actorId: BigInt(actor.sub), action: 'TRANSFER', entity: 'ClassTransfer', entityId: String(transfer.id), newValue: { ...dto } } });
      return transfer.id;
    }, transactionOptions);
    return { id: String(id), status: 'APPROVED' };
  }
  async reserve(dto: ReservationDto, actor: AuthPayload) {
    const studentId = BigInt(dto.studentId), classId = BigInt(dto.classId);
    const startDate = new Date(`${dto.startDate.slice(0,10)}T00:00:00.000Z`);
    if (startDate.getTime() !== localToday().getTime()) throw new BadRequestException('Reservation starts today; future-dated requests require a separate approval workflow');
    const endDate = addCalendarMonths(startDate, dto.durationMonths);
    const id = await this.prisma.$transaction(async tx => {
      await this.lock(tx, [classId]);
      const enrollment = await tx.enrollment.findUnique({ where: { studentId_classId: { studentId, classId } } });
      if (!enrollment || enrollment.status !== 'ACTIVE') throw new ConflictException('Student must be actively enrolled');
      if (await tx.studyReservation.findFirst({ where: { studentId, classId, isActive: true } })) throw new ConflictException('Reservation already active');
      await tx.enrollment.update({ where: { id: enrollment.id }, data: { status: 'RESERVED' } });
      const reservation = await tx.studyReservation.create({ data: { studentId, classId, reason: dto.reason, status: 'APPROVED', startDate, endDate, durationMonths: dto.durationMonths, isActive: true } });
      await tx.auditLog.create({ data: { actorId: BigInt(actor.sub), action: 'RESERVE', entity: 'StudyReservation', entityId: String(reservation.id), newValue: { ...dto } } });
      return reservation.id;
    }, transactionOptions);
    return { id: String(id), status: 'APPROVED', endDate };
  }
  async resume(id: string, actor: AuthPayload) {
    await this.prisma.$transaction(async tx => {
      const initial = await tx.studyReservation.findUnique({ where: { id: BigInt(id) } });
      if (!initial) throw new BadRequestException('Reservation not found');
      await this.lock(tx, [initial.classId]);
      const current = await tx.studyReservation.findUniqueOrThrow({ where: { id: initial.id } });
      if (!current.isActive || current.status !== 'APPROVED') throw new ConflictException('Reservation is not active');
      if (!current.endDate || current.endDate <= localToday()) throw new ConflictException('Reservation has expired');
      const destination = await tx.class.findUniqueOrThrow({ where: { id: current.classId } });
      if (!['ACTIVE','UPCOMING'].includes(destination.status) || destination.studentCount >= destination.capacity) throw new ConflictException('Class is full or no longer open');
      const enrollment = await tx.enrollment.findUniqueOrThrow({ where: { studentId_classId: { studentId: current.studentId, classId: current.classId } } });
      if (enrollment.status !== 'RESERVED') throw new ConflictException('Enrollment is not reserved');
      await tx.enrollment.update({ where: { id: enrollment.id }, data: { status: 'ACTIVE', leftAt: null } });
      await tx.studyReservation.update({ where: { id: current.id }, data: { isActive: false } });
      await tx.auditLog.create({ data: { actorId: BigInt(actor.sub), action: 'RESUME', entity: 'StudyReservation', entityId: id } });
    }, transactionOptions);
    return { id, resumed: true };
  }
  async cancel(id: string, actor: AuthPayload) {
    await this.prisma.$transaction(async tx => {
      const initial = await tx.studyReservation.findUnique({ where: { id: BigInt(id) } });
      if (!initial) throw new BadRequestException('Reservation not found');
      await this.lock(tx, [initial.classId]);
      const current = await tx.studyReservation.findUniqueOrThrow({ where: { id: initial.id } });
      if (!current.isActive) throw new ConflictException('Reservation is not active');
      await tx.enrollment.updateMany({ where: { studentId: current.studentId, classId: current.classId, status: 'RESERVED' }, data: { status: 'CANCELLED', leftAt: new Date() } });
      await tx.studyReservation.update({ where: { id: current.id }, data: { isActive: false, status: 'CANCELLED' } });
      await tx.auditLog.create({ data: { actorId: BigInt(actor.sub), action: 'CANCEL_RESERVATION', entity: 'StudyReservation', entityId: id } });
    }, transactionOptions);
    return { id, cancelled: true };
  }
  async expire(actor?: AuthPayload) {
    const due = await this.prisma.studyReservation.findMany({ where: { isActive: true, endDate: { lte: localToday() } }, select: { id: true, classId: true }, take: 500 });
    let expired = 0;
    for (const item of due) {
      await this.prisma.$transaction(async tx => {
        await this.lock(tx, [item.classId]);
        const current = await tx.studyReservation.findUniqueOrThrow({ where: { id: item.id } });
        if (!current.isActive || !current.endDate || current.endDate > localToday()) return;
        await tx.enrollment.updateMany({ where: { studentId: current.studentId, classId: current.classId, status: 'RESERVED' }, data: { status: 'CANCELLED', leftAt: new Date() } });
        await tx.studyReservation.update({ where: { id: current.id }, data: { isActive: false } });
        await tx.auditLog.create({ data: { actorId: actor ? BigInt(actor.sub) : null, action: 'EXPIRE', entity: 'StudyReservation', entityId: String(current.id) } });
        expired++;
      }, transactionOptions);
    }
    return { expired };
  }
}
