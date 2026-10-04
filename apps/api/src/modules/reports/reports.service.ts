import { Injectable } from '@nestjs/common';
import { ClassStatus, EnrollmentStatus, Prisma, UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { notFound } from '../../common/http-errors';
import type { AuthPayload } from '../auth/auth.types';
import { ReportFilterDto } from './dto/report-filter.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(user: AuthPayload) {
    const activities = await this.dashboardActivities();
    if (user.role === UserRole.STUDENT) return this.studentDashboard(user, activities);
    if (user.role === UserRole.TEACHER) return this.teacherDashboard(user, activities);
    if (user.role === UserRole.DIRECTOR) {
      const overview = await this.getDirectorDashboard();
      return { ...overview, schedule: await this.scheduleFor({ class: { status: ClassStatus.ACTIVE } }), activities };
    }

    const [students, teachers, activeClasses, upcomingClasses] = await this.prisma.$transaction([
      this.prisma.student.count({ where: { user: { status: UserStatus.ACTIVE } } }),
      this.prisma.teacher.count({ where: { user: { status: UserStatus.ACTIVE } } }),
      this.prisma.class.count({ where: { status: ClassStatus.ACTIVE } }),
      this.prisma.class.count({ where: { status: ClassStatus.UPCOMING } }),
    ]);
    return {
      stats: [
        { label: 'Tổng học viên', value: String(students), change: 'Dữ liệu hiện tại', trend: 'neutral', icon: 'users' },
        { label: 'Tổng giáo viên', value: String(teachers), change: 'Đang hoạt động', trend: 'neutral', icon: 'user' },
        { label: 'Lớp đang hoạt động', value: String(activeClasses), change: 'Đang vận hành', trend: 'neutral', icon: 'book' },
        { label: 'Sắp khai giảng', value: String(upcomingClasses), change: 'Theo dữ liệu lớp học', trend: 'neutral', icon: 'calendar' },
      ],
      schedule: await this.scheduleFor({ class: { status: { in: [ClassStatus.ACTIVE, ClassStatus.UPCOMING] } } }),
      activities,
    };
  }

  private async studentDashboard(user: AuthPayload, activities: Awaited<ReturnType<ReportsService['dashboardActivities']>>) {
    const student = await this.prisma.student.findUnique({ where: { userId: BigInt(user.sub) }, include: { enrollments: { where: { status: EnrollmentStatus.ACTIVE }, include: { class: { include: { course: true } } } } } });
    if (!student) notFound('Student profile', user.sub);
    const [attendance, scores] = await this.prisma.$transaction([
      this.prisma.attendance.findMany({ where: { studentId: student.id }, select: { status: true } }),
      this.prisma.score.findMany({ where: { studentId: student.id }, select: { value: true } }),
    ]);
    const attended = attendance.filter((record) => record.status === 'PRESENT' || record.status === 'LATE').length;
    const average = scores.length ? (scores.reduce((sum, score) => sum + Number(score.value), 0) / scores.length).toFixed(1) : '0.0';
    return {
      stats: [
        { label: 'Khóa đang học', value: String(student.enrollments.length).padStart(2, '0'), change: student.enrollments[0]?.class.course.name ?? 'Chưa có lớp', trend: 'neutral', icon: 'book' },
        { label: 'Trình độ hiện tại', value: student.currentLevel ?? '-', change: `Mục tiêu ${student.targetLevel ?? '-'}`, trend: 'up', icon: 'target' },
        { label: 'Tỷ lệ chuyên cần', value: `${attendance.length ? Math.round((attended / attendance.length) * 100) : 0}%`, change: `${attended}/${attendance.length} lượt hợp lệ`, trend: 'neutral', icon: 'check' },
        { label: 'Điểm trung bình', value: average, change: `${scores.length} bài đã chấm`, trend: 'neutral', icon: 'chart' },
      ],
      schedule: await this.scheduleFor({ class: { enrollments: { some: { studentId: student.id, status: EnrollmentStatus.ACTIVE } } } }),
      activities,
    };
  }

  private async teacherDashboard(user: AuthPayload, activities: Awaited<ReturnType<ReportsService['dashboardActivities']>>) {
    const teacher = await this.prisma.teacher.findUnique({ where: { userId: BigInt(user.sub) } });
    if (!teacher) notFound('Teacher profile', user.sub);
    const [classes, lessons, tests] = await this.prisma.$transaction([
      this.prisma.class.findMany({ where: { teacherId: teacher.id, status: { not: ClassStatus.CANCELLED } }, include: { _count: { select: { enrollments: true } } } }),
      this.prisma.lesson.findMany({ where: { class: { teacherId: teacher.id }, lessonDate: { gte: this.daysAgo(7) }, status: { not: 'CANCELLED' } }, include: { _count: { select: { attendance: true } } } }),
      this.prisma.test.findMany({ where: { class: { teacherId: teacher.id } }, include: { _count: { select: { scores: true } }, class: { select: { _count: { select: { enrollments: true } } } } } }),
    ]);
    const pendingAttendance = lessons.filter((lesson) => lesson.lessonDate <= new Date() && lesson._count.attendance === 0).length;
    const pendingScores = tests.filter((test) => test._count.scores < test.class._count.enrollments).length;
    return {
      stats: [
        { label: 'Lớp phụ trách', value: String(classes.length).padStart(2, '0'), change: `${classes.reduce((sum, item) => sum + item._count.enrollments, 0)} học viên`, trend: 'neutral', icon: 'book' },
        { label: 'Buổi dạy tuần này', value: String(lessons.length).padStart(2, '0'), change: 'Theo lịch hiện tại', trend: 'neutral', icon: 'calendar' },
        { label: 'Chưa điểm danh', value: String(pendingAttendance).padStart(2, '0'), change: 'Cần xử lý', trend: pendingAttendance ? 'down' : 'neutral', icon: 'check' },
        { label: 'Chưa nhập điểm', value: String(pendingScores).padStart(2, '0'), change: 'Theo bài kiểm tra', trend: pendingScores ? 'down' : 'neutral', icon: 'chart' },
      ],
      schedule: await this.scheduleFor({ class: { teacherId: teacher.id } }),
      activities,
    };
  }

  private async dashboardActivities() {
    const logs = await this.prisma.auditLog.findMany({ include: { actor: { select: { fullName: true } } }, orderBy: { createdAt: 'desc' }, take: 10 });
    return logs.map((log) => ({ title: `${log.action} ${log.entity}`, description: log.actor?.fullName ?? 'Hệ thống', time: log.createdAt.toISOString(), type: log.action.includes('DELETE') ? 'warning' as const : log.action.includes('CREATE') ? 'success' as const : 'info' as const }));
  }

  private async scheduleFor(where: Prisma.LessonWhereInput) {
    const lessons = await this.prisma.lesson.findMany({ where: { ...where, status: { not: 'CANCELLED' }, lessonDate: { gte: new Date() } }, include: { class: true }, orderBy: [{ lessonDate: 'asc' }, { startTime: 'asc' }], take: 6 });
    return lessons.map((lesson) => ({ id: lesson.id.toString(), date: lesson.lessonDate.toISOString(), title: lesson.title, detail: `${lesson.class.code} · ${lesson.class.room ?? 'Chưa xếp phòng'}`, classCode: lesson.class.code, startTime: lesson.startTime.toISOString().slice(11, 16), endTime: lesson.endTime.toISOString().slice(11, 16) }));
  }

  async getFilters() {
    const [classes, teachers] = await this.prisma.$transaction([
      this.prisma.class.findMany({ where: { status: { not: ClassStatus.CANCELLED } }, select: { id: true, code: true, name: true }, orderBy: { code: 'asc' } }),
      this.prisma.teacher.findMany({ where: { user: { status: UserStatus.ACTIVE } }, select: { id: true, teacherCode: true, user: { select: { fullName: true } } }, orderBy: { teacherCode: 'asc' } }),
    ]);
    return { classes: classes.map((item) => ({ id: item.id.toString(), code: item.code, name: item.name })), teachers: teachers.map((item) => ({ id: item.id.toString(), code: item.teacherCode, name: item.user.fullName })) };
  }

  async getTeacherPerformance(filter: ReportFilterDto) {
    const classWhere = this.reportClassWhere(filter);
    const dateWhere = this.dateWhere(filter);
    const teachers = await this.prisma.teacher.findMany({ where: { user: { status: UserStatus.ACTIVE, ...(filter.teacherName ? { fullName: { contains: filter.teacherName, mode: 'insensitive' } } : {}) } }, include: { user: true, classes: { where: classWhere, include: { enrollments: { where: { status: EnrollmentStatus.ACTIVE } }, lessons: { where: dateWhere ? { lessonDate: dateWhere } : {}, include: { attendance: true } }, tests: { where: dateWhere ? { testDate: dateWhere } : {}, include: { scores: { select: { value: true } } } } } } } });
    return { data: teachers.map((teacher) => { const attendance = teacher.classes.flatMap((item) => item.lessons.flatMap((lesson) => lesson.attendance)); const attended = attendance.filter((record) => record.status === 'PRESENT' || record.status === 'LATE').length; const scores = teacher.classes.flatMap((item) => item.tests.flatMap((test) => test.scores.map((score) => Number(score.value)))); return { name: teacher.user.fullName, classes: teacher.classes.length, students: teacher.classes.reduce((sum, item) => sum + item.enrollments.length, 0), attendance: attendance.length ? Math.round((attended / attendance.length) * 100) : 0, averageScore: scores.length ? Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1)) : 0 }; }) };
  }

  async getDirectorDashboard() {
    const [students, newStudents, teachers, activeClasses, enrollments, attendance, scores, classes, teacherRows] = await this.prisma.$transaction([
      this.prisma.student.count({ where: { user: { status: UserStatus.ACTIVE } } }),
      this.prisma.student.count({ where: { createdAt: { gte: this.daysAgo(30) } } }),
      this.prisma.teacher.count({ where: { user: { status: UserStatus.ACTIVE } } }),
      this.prisma.class.count({ where: { status: ClassStatus.ACTIVE } }),
      this.prisma.enrollment.count({ where: { status: EnrollmentStatus.ACTIVE } }),
      this.prisma.attendance.findMany({ select: { status: true } }),
      this.prisma.score.findMany({ select: { value: true } }),
      this.prisma.class.findMany({ where: { status: ClassStatus.ACTIVE }, include: { _count: { select: { enrollments: true } } }, orderBy: { code: 'asc' } }),
      this.prisma.teacher.findMany({ where: { user: { status: UserStatus.ACTIVE } }, include: { user: true, _count: { select: { classes: true } }, classes: { select: { tests: { select: { scores: { select: { value: true } } } } } } } }),
    ]);
    const present = attendance.filter((item) => item.status === 'PRESENT').length;
    const late = attendance.filter((item) => item.status === 'LATE').length;
    const averageScore = scores.length ? Number((scores.reduce((sum, item) => sum + Number(item.value), 0) / scores.length).toFixed(1)) : 0;
    const capacity = await this.prisma.class.aggregate({ where: { status: ClassStatus.ACTIVE }, _sum: { capacity: true } });
    const monthly = await this.monthlyStudentCounts();
    const levels = await Promise.all(['N5', 'N4', 'N3', 'N2', 'N1'].map(async (level) => ({ level, students: await this.prisma.student.count({ where: { currentLevel: level as any, user: { status: UserStatus.ACTIVE } } }) })));
    return {
      stats: [
        { label: 'Tổng học viên', value: String(students), change: `+${newStudents} trong 30 ngày`, trend: 'up', icon: 'users' },
        { label: 'Học viên mới', value: String(newStudents), change: 'Trong 30 ngày qua', trend: 'up', icon: 'user' },
        { label: 'Tỷ lệ chuyên cần', value: `${attendance.length ? Math.round(((present + late) / attendance.length) * 100) : 0}%`, change: `${present} có mặt`, trend: 'up', icon: 'check' },
        { label: 'Tỷ lệ lấp đầy lớp', value: `${capacity._sum.capacity ? Math.round((enrollments / capacity._sum.capacity) * 100) : 0}%`, change: `${activeClasses} lớp đang hoạt động`, trend: 'neutral', icon: 'chart' },
      ],
      averageScore,
      monthlyStudents: monthly,
      levels,
      attendance: [{ month: 'Hiện tại', rate: attendance.length ? Math.round(((present + late) / attendance.length) * 100) : 0 }],
      teacherPerformance: teacherRows.map((teacher) => { const teacherScores = teacher.classes.flatMap((item) => item.tests.flatMap((test) => test.scores.map((score) => Number(score.value)))); return { name: teacher.user.fullName, score: teacherScores.length ? Number((teacherScores.reduce((sum, score) => sum + score, 0) / teacherScores.length).toFixed(1)) : 0, classes: teacher._count.classes }; }),
      classOccupancy: classes.map((item) => ({ code: item.code, occupancy: item.capacity ? Math.round((item._count.enrollments / item.capacity) * 100) : 0, students: item._count.enrollments, capacity: item.capacity })),
      activeClasses,
    };
  }

  async getReports(filter: ReportFilterDto) {
    const classWhere = this.reportClassWhere(filter);
    const dateWhere = this.dateWhere(filter);
    const [students, classes, attendance, scores] = await this.prisma.$transaction([
      this.prisma.student.findMany({ where: { ...(filter.level ? { currentLevel: filter.level } : {}), user: { status: UserStatus.ACTIVE } }, select: { currentLevel: true } }),
      this.prisma.class.findMany({ where: classWhere, include: { course: true, teacher: { include: { user: true } }, enrollments: { where: { status: EnrollmentStatus.ACTIVE } }, lessons: { where: dateWhere ? { lessonDate: dateWhere } : {}, include: { attendance: true } } }, orderBy: { code: 'asc' } }),
      this.prisma.attendance.findMany({ where: dateWhere ? { lesson: { lessonDate: dateWhere } } : {}, select: { status: true } }),
      this.prisma.score.findMany({ where: dateWhere ? { test: { testDate: dateWhere } } : {}, select: { value: true } }),
    ]);
    const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
    const studentByLevel = levels.map((level) => ({ level, active: students.filter((item) => item.currentLevel === level).length }));
    const classReport = classes.map((item) => { const records = item.lessons.flatMap((lesson) => lesson.attendance); const present = records.filter((record) => record.status === 'PRESENT' || record.status === 'LATE').length; return { code: item.code, course: item.course.name, teacher: item.teacher.user.fullName, students: item.enrollments.length, capacity: item.capacity, attendance: records.length ? Math.round((present / records.length) * 100) : 0 }; });
    const present = attendance.filter((item) => item.status === 'PRESENT' || item.status === 'LATE').length;
    const averageScore = scores.length ? Number((scores.reduce((sum, item) => sum + Number(item.value), 0) / scores.length).toFixed(1)) : 0;
    return { summary: [{ label: 'Tổng học viên', value: String(students.length), note: 'Theo bộ lọc hiện tại' }, { label: 'Lớp đang hoạt động', value: String(classes.length), note: 'Theo bộ lọc hiện tại' }, { label: 'Tỷ lệ chuyên cần', value: `${attendance.length ? Math.round((present / attendance.length) * 100) : 0}%`, note: 'Có mặt và đi muộn' }, { label: 'Điểm trung bình', value: averageScore.toFixed(1), note: 'Trên các bài đã chấm' }], studentByLevel, classReport, teacherReport: (await this.getTeacherPerformance(filter)).data };
  }

  private reportClassWhere(filter: ReportFilterDto): Prisma.ClassWhereInput {
    return { ...(filter.classId ? { id: BigInt(filter.classId) } : {}), ...(filter.teacherId ? { teacherId: BigInt(filter.teacherId) } : {}), ...(filter.classCode ? { code: filter.classCode } : {}) };
  }

  private dateWhere(filter: ReportFilterDto): Prisma.DateTimeFilter | undefined {
    if (filter.fromDate || filter.toDate) return { ...(filter.fromDate ? { gte: new Date(`${filter.fromDate.slice(0, 10)}T00:00:00.000Z`) } : {}), ...(filter.toDate ? { lte: new Date(`${filter.toDate.slice(0, 10)}T23:59:59.999Z`) } : {}) };
    if (!filter.period || filter.period === 'year') return undefined;
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    if (filter.period === 'last-month') { const previous = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() - 1, 1)); return { gte: previous, lt: start }; }
    if (filter.period === 'quarter') return { gte: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 2, 1)) };
    return { gte: start };
  }

  private daysAgo(days: number) { return new Date(Date.now() - days * 24 * 60 * 60 * 1000); }

  private async monthlyStudentCounts() {
    const result: { month: string; students: number; newStudents: number }[] = [];
    for (let index = 5; index >= 0; index -= 1) {
      const start = new Date();
      start.setUTCDate(1);
      start.setUTCMonth(start.getUTCMonth() - index);
      const end = new Date(start);
      end.setUTCMonth(end.getUTCMonth() + 1);
      const count = await this.prisma.student.count({ where: { createdAt: { lt: end } } });
      const newStudents = await this.prisma.student.count({ where: { createdAt: { gte: start, lt: end } } });
      result.push({ month: `T${start.getUTCMonth() + 1}`, students: count, newStudents });
    }
    return result;
  }
}
