import * as argon2 from 'argon2';
import { PrismaClient, AttendanceStatus, ClassStatus, CourseStatus, EnrollmentStatus, JlptLevel, LessonStatus, TestType, UserRole, UserStatus } from '@prisma/client';

const prisma = new PrismaClient();
const demoPassword = '12345678';
const date = (value: string) => new Date(`${value}T00:00:00.000Z`);
const time = (value: string) => new Date(`1970-01-01T${value}:00.000Z`);

async function main() {
  const passwordHash = await argon2.hash(demoPassword);
  const users = await Promise.all([
    prisma.user.upsert({ where: { email: 'student@riki.vn' }, update: { fullName: 'Nguyễn Minh Anh', role: UserRole.STUDENT, status: UserStatus.ACTIVE }, create: { email: 'student@riki.vn', passwordHash, fullName: 'Nguyễn Minh Anh', role: UserRole.STUDENT } }),
    prisma.user.upsert({ where: { email: 'teacher@riki.vn' }, update: { fullName: 'Phạm Nhật Nam', role: UserRole.TEACHER, status: UserStatus.ACTIVE }, create: { email: 'teacher@riki.vn', passwordHash, fullName: 'Phạm Nhật Nam', role: UserRole.TEACHER } }),
    prisma.user.upsert({ where: { email: 'academic@riki.vn' }, update: { fullName: 'Lê Thu Hà', role: UserRole.ACADEMIC_STAFF, status: UserStatus.ACTIVE }, create: { email: 'academic@riki.vn', passwordHash, fullName: 'Lê Thu Hà', role: UserRole.ACADEMIC_STAFF } }),
    prisma.user.upsert({ where: { email: 'director@riki.vn' }, update: { fullName: 'Trần Minh Quân', role: UserRole.DIRECTOR, status: UserStatus.ACTIVE }, create: { email: 'director@riki.vn', passwordHash, fullName: 'Trần Minh Quân', role: UserRole.DIRECTOR } }),
  ]);

  const studentUser = users[0];
  const teacherUser = users[1];
  const student = await prisma.student.upsert({ where: { studentCode: 'HV001' }, update: { userId: studentUser.id, currentLevel: JlptLevel.N4, targetLevel: JlptLevel.N3 }, create: { userId: studentUser.id, studentCode: 'HV001', gender: 'Nữ', dateOfBirth: date('2000-05-15'), currentLevel: JlptLevel.N4, targetLevel: JlptLevel.N3 } });
  const teacher = await prisma.teacher.upsert({ where: { teacherCode: 'GV001' }, update: { userId: teacherUser.id, jlptLevel: JlptLevel.N1, phone: '0909876543' }, create: { userId: teacherUser.id, teacherCode: 'GV001', phone: '0909876543', jlptLevel: JlptLevel.N1 } });

  const courseN4 = await prisma.course.upsert({ where: { code: 'N4-CORE' }, update: {}, create: { code: 'N4-CORE', name: 'Tiếng Nhật N4', level: JlptLevel.N4, totalLessons: 24, tuition: 5200000, status: CourseStatus.ACTIVE } });
  const courseN3 = await prisma.course.upsert({ where: { code: 'N3-CORE' }, update: {}, create: { code: 'N3-CORE', name: 'Tiếng Nhật N3', level: JlptLevel.N3, totalLessons: 30, tuition: 6500000, status: CourseStatus.ACTIVE } });
  const classN4 = await prisma.class.upsert({ where: { code: 'RKN4-01' }, update: {}, create: { code: 'RKN4-01', name: 'Tiếng Nhật N4 · Tối', courseId: courseN4.id, teacherId: teacher.id, startDate: date('2026-08-01'), schedule: 'Thứ 2, 4, 6 · 18:30', room: 'Phòng A-204', capacity: 20, status: ClassStatus.ACTIVE } });
  const classN3 = await prisma.class.upsert({ where: { code: 'RKN3-03' }, update: {}, create: { code: 'RKN3-03', name: 'Tiếng Nhật N3 · Tối', courseId: courseN3.id, teacherId: teacher.id, startDate: date('2026-08-05'), schedule: 'Thứ 3, 5, 7 · 19:00', room: 'Phòng B-102', capacity: 30, status: ClassStatus.ACTIVE } });

  await prisma.enrollment.upsert({ where: { studentId_classId: { studentId: student.id, classId: classN4.id } }, update: { status: EnrollmentStatus.ACTIVE }, create: { studentId: student.id, classId: classN4.id, status: EnrollmentStatus.ACTIVE } });
  const lesson = await prisma.lesson.findFirst({ where: { classId: classN4.id, title: 'Kaiwa: Giới thiệu bản thân' } }) ?? await prisma.lesson.create({ data: { classId: classN4.id, title: 'Kaiwa: Giới thiệu bản thân', lessonDate: date('2026-08-22'), startTime: time('18:30'), endTime: time('20:00'), content: 'Luyện hội thoại giới thiệu bản thân.', status: LessonStatus.UPCOMING } });
  await prisma.attendance.upsert({ where: { lessonId_studentId: { lessonId: lesson.id, studentId: student.id } }, update: { status: AttendanceStatus.PRESENT }, create: { lessonId: lesson.id, studentId: student.id, status: AttendanceStatus.PRESENT } });
  const test = await prisma.test.findFirst({ where: { classId: classN4.id, name: 'Bài kiểm tra giữa khóa' } }) ?? await prisma.test.create({ data: { classId: classN4.id, name: 'Bài kiểm tra giữa khóa', type: TestType.MIDTERM, testDate: date('2026-08-18') } });
  await prisma.score.upsert({ where: { testId_studentId: { testId: test.id, studentId: student.id } }, update: { value: 9.2 }, create: { testId: test.id, studentId: student.id, value: 9.2, note: 'Bài làm tốt' } });

  console.log(`Seeded Riki LMS demo data: student@riki.vn / ${demoPassword}`);
  console.log(`Classes: ${classN4.code}, ${classN3.code}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => { await prisma.$disconnect(); });
