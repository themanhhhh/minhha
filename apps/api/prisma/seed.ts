import * as argon2 from 'argon2';
import {
  AttendanceStatus,
  ClassStatus,
  CourseStatus,
  EnrollmentStatus,
  JlptLevel,
  LessonStatus,
  PrismaClient,
  TestType,
  UserRole,
  UserStatus,
} from '@prisma/client';

const seedDatabaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!seedDatabaseUrl) throw new Error('DATABASE_URL or DIRECT_URL is required to run the seed');
const prisma = new PrismaClient({ datasources: { db: { url: seedDatabaseUrl } } });
const demoPassword = '12345678';
const date = (value: string) => new Date(`${value}T00:00:00.000Z`);
const time = (value: string) => new Date(`1970-01-01T${value}:00.000Z`);
const pad = (value: number, size = 2) => String(value).padStart(size, '0');

function startOfToday() {
  const value = new Date();
  value.setUTCHours(0, 0, 0, 0);
  return value;
}

function addDays(value: Date, days: number) {
  const result = new Date(value);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function daysAgo(days: number) {
  return addDays(new Date(), -days);
}

async function upsertUser(input: { email: string; fullName: string; role: UserRole; createdAt: Date; passwordHash: string }) {
  return prisma.user.upsert({
    where: { email: input.email },
    update: {
      fullName: input.fullName,
      passwordHash: input.passwordHash,
      role: input.role,
      status: UserStatus.ACTIVE,
      createdAt: input.createdAt,
    },
    create: {
      email: input.email,
      passwordHash: input.passwordHash,
      fullName: input.fullName,
      role: input.role,
      status: UserStatus.ACTIVE,
      createdAt: input.createdAt,
    },
  });
}

async function upsertStudent(input: {
  userId: bigint;
  studentCode: string;
  gender: string;
  dateOfBirth: Date;
  currentLevel: JlptLevel;
  targetLevel: JlptLevel;
  createdAt: Date;
}) {
  return prisma.student.upsert({
    where: { studentCode: input.studentCode },
    update: {
      userId: input.userId,
      gender: input.gender,
      dateOfBirth: input.dateOfBirth,
      currentLevel: input.currentLevel,
      targetLevel: input.targetLevel,
      createdAt: input.createdAt,
    },
    create: input,
  });
}

async function upsertTeacher(input: {
  userId: bigint;
  teacherCode: string;
  phone: string;
  jlptLevel: JlptLevel;
  createdAt: Date;
}) {
  return prisma.teacher.upsert({
    where: { teacherCode: input.teacherCode },
    update: {
      userId: input.userId,
      phone: input.phone,
      jlptLevel: input.jlptLevel,
      createdAt: input.createdAt,
    },
    create: input,
  });
}

async function main() {
  const today = startOfToday();
  const passwordHash = await argon2.hash(demoPassword);

  const staffDefinitions = [
    { email: 'academic@riki.vn', fullName: 'Lê Thu Hà', role: UserRole.ACADEMIC_STAFF },
    { email: 'director@riki.vn', fullName: 'Trần Minh Quân', role: UserRole.DIRECTOR },
  ];
  const staffUsers = new Map<string, Awaited<ReturnType<typeof upsertUser>>>();
  for (const [index, definition] of staffDefinitions.entries()) {
    staffUsers.set(definition.email, await upsertUser({ ...definition, passwordHash, createdAt: daysAgo(150 - index * 20) }));
  }

  const studentNames = [
    'Nguyễn Minh Anh',
    'Trần Hoàng Nam',
    'Lê Khánh Linh',
    'Phạm Gia Huy',
    'Võ Ngọc Hân',
    'Đặng Minh Khang',
    'Bùi Thu Trang',
    'Đỗ Quang Huy',
    'Hồ Thanh Mai',
    'Ngô Nhật Minh',
    'Dương Hải Yến',
    'Vũ Đức Anh',
    'Huỳnh Lan Chi',
    'Phan Tuấn Kiệt',
    'Mai Phương Thảo',
    'Cao Minh Đức',
    'Tạ Bảo Ngọc',
    'Lương Quốc Bảo',
    'Trịnh Hà My',
    'Nguyễn Thành Đạt',
    'Trần Ngọc Anh',
    'Lê Hoàng Long',
    'Phạm Yến Nhi',
    'Võ Anh Tuấn',
    'Đặng Thùy Dương',
    'Bùi Gia Bảo',
    'Đỗ Minh Châu',
    'Hồ Quốc Khánh',
    'Ngô Thanh Tâm',
    'Dương Quỳnh Như',
    'Vũ Minh Quân',
    'Huỳnh Bảo Trân',
    'Phan Nhật Hào',
    'Mai Ngọc Diệp',
    'Cao Anh Khoa',
    'Tạ Minh Thư',
  ];
  const levels = [JlptLevel.N5, JlptLevel.N4, JlptLevel.N3, JlptLevel.N2, JlptLevel.N1];
  const nextLevel: Record<JlptLevel, JlptLevel> = {
    [JlptLevel.N5]: JlptLevel.N4,
    [JlptLevel.N4]: JlptLevel.N3,
    [JlptLevel.N3]: JlptLevel.N2,
    [JlptLevel.N2]: JlptLevel.N1,
    [JlptLevel.N1]: JlptLevel.N1,
  };
  const students: Awaited<ReturnType<typeof upsertStudent>>[] = [];
  const studentIndexById = new Map<string, number>();

  for (const [index, fullName] of studentNames.entries()) {
    const currentLevel = levels[index % levels.length];
    const createdAt = daysAgo((index * 7) % 180);
    const email = index === 0 ? 'student@riki.vn' : `student${pad(index + 1, 3)}@riki.vn`;
    const studentCode = `HV${pad(index + 1, 3)}`;
    const user = await upsertUser({
      email,
      fullName,
      role: UserRole.STUDENT,
      passwordHash,
      createdAt,
    });
    const student = await upsertStudent({
      userId: user.id,
      studentCode,
      gender: index % 2 === 0 ? 'Nữ' : 'Nam',
      dateOfBirth: date(`${1995 + (index % 9)}-${pad((index % 12) + 1)}-${pad((index * 3) % 25 + 1)}`),
      currentLevel,
      targetLevel: nextLevel[currentLevel],
      createdAt,
    });
    students.push(student);
    studentIndexById.set(student.id.toString(), index);
  }

  const teacherDefinitions = [
    { email: 'teacher@riki.vn', fullName: 'Phạm Nhật Nam', jlptLevel: JlptLevel.N1 },
    { email: 'teacher002@riki.vn', fullName: 'Nguyễn Thu Hà', jlptLevel: JlptLevel.N2 },
    { email: 'teacher003@riki.vn', fullName: 'Trần Minh Đức', jlptLevel: JlptLevel.N1 },
    { email: 'teacher004@riki.vn', fullName: 'Lê Thanh Hương', jlptLevel: JlptLevel.N3 },
    { email: 'teacher005@riki.vn', fullName: 'Võ Hoàng Sơn', jlptLevel: JlptLevel.N2 },
    { email: 'teacher006@riki.vn', fullName: 'Đặng Mai Linh', jlptLevel: JlptLevel.N1 },
    { email: 'teacher007@riki.vn', fullName: 'Bùi Quốc Việt', jlptLevel: JlptLevel.N3 },
    { email: 'teacher008@riki.vn', fullName: 'Hồ Ngọc Phương', jlptLevel: JlptLevel.N2 },
  ];
  const teachersByCode = new Map<string, Awaited<ReturnType<typeof upsertTeacher>>>();
  for (const [index, definition] of teacherDefinitions.entries()) {
    const teacherCode = `GV${pad(index + 1, 3)}`;
    const user = await upsertUser({
      email: definition.email,
      fullName: definition.fullName,
      role: UserRole.TEACHER,
      passwordHash,
      createdAt: daysAgo(20 + index * 15),
    });
    teachersByCode.set(teacherCode, await upsertTeacher({
      userId: user.id,
      teacherCode,
      phone: `090${String(9876543 + index).padStart(7, '0')}`,
      jlptLevel: definition.jlptLevel,
      createdAt: daysAgo(20 + index * 15),
    }));
  }

  const courseDefinitions = [
    { code: 'N5-CORE', name: 'Tiếng Nhật N5', level: JlptLevel.N5, totalLessons: 20, tuition: 4200000 },
    { code: 'N4-CORE', name: 'Tiếng Nhật N4', level: JlptLevel.N4, totalLessons: 24, tuition: 5200000 },
    { code: 'N3-CORE', name: 'Tiếng Nhật N3', level: JlptLevel.N3, totalLessons: 30, tuition: 6500000 },
    { code: 'N2-CORE', name: 'Tiếng Nhật N2', level: JlptLevel.N2, totalLessons: 32, tuition: 7200000 },
    { code: 'N1-CORE', name: 'Tiếng Nhật N1', level: JlptLevel.N1, totalLessons: 36, tuition: 8500000 },
    { code: 'N2-GIAO-TIEP', name: 'Tiếng Nhật giao tiếp công sở', level: JlptLevel.N2, totalLessons: 18, tuition: 4800000 },
  ];
  const coursesByCode = new Map<string, Awaited<ReturnType<typeof prisma.course.upsert>>>();
  for (const [index, definition] of courseDefinitions.entries()) {
    coursesByCode.set(definition.code, await prisma.course.upsert({
      where: { code: definition.code },
      update: { ...definition, status: CourseStatus.ACTIVE, createdAt: daysAgo(180 - index * 15) },
      create: { ...definition, status: CourseStatus.ACTIVE, createdAt: daysAgo(180 - index * 15) },
    }));
  }

  const classDefinitions = [
    { code: 'RKN5-01', courseCode: 'N5-CORE', teacherCode: 'GV002', name: 'Tiếng Nhật N5 · Sáng', schedule: 'Thứ 2, 4, 6 · 09:00', room: 'Phòng A-101', capacity: 24, status: ClassStatus.ACTIVE },
    { code: 'RKN5-02', courseCode: 'N5-CORE', teacherCode: 'GV004', name: 'Tiếng Nhật N5 · Tối', schedule: 'Thứ 3, 5, 7 · 18:30', room: 'Phòng A-102', capacity: 24, status: ClassStatus.ACTIVE },
    { code: 'RKN4-01', courseCode: 'N4-CORE', teacherCode: 'GV001', name: 'Tiếng Nhật N4 · Tối', schedule: 'Thứ 2, 4, 6 · 18:30', room: 'Phòng A-204', capacity: 20, status: ClassStatus.ACTIVE },
    { code: 'RKN4-02', courseCode: 'N4-CORE', teacherCode: 'GV005', name: 'Tiếng Nhật N4 · Cuối tuần', schedule: 'Thứ 7, CN · 09:00', room: 'Phòng A-205', capacity: 24, status: ClassStatus.ACTIVE },
    { code: 'RKN3-03', courseCode: 'N3-CORE', teacherCode: 'GV001', name: 'Tiếng Nhật N3 · Tối', schedule: 'Thứ 3, 5, 7 · 19:00', room: 'Phòng B-102', capacity: 30, status: ClassStatus.ACTIVE },
    { code: 'RKN3-04', courseCode: 'N3-CORE', teacherCode: 'GV006', name: 'Tiếng Nhật N3 · Sáng', schedule: 'Thứ 2, 4, 6 · 09:00', room: 'Phòng B-103', capacity: 26, status: ClassStatus.ACTIVE },
    { code: 'RKN2-01', courseCode: 'N2-CORE', teacherCode: 'GV003', name: 'Tiếng Nhật N2 · Tối', schedule: 'Thứ 2, 4, 6 · 19:00', room: 'Phòng B-201', capacity: 24, status: ClassStatus.ACTIVE },
    { code: 'RKN2-02', courseCode: 'N2-CORE', teacherCode: 'GV007', name: 'Tiếng Nhật N2 · Cuối tuần', schedule: 'Thứ 7, CN · 13:30', room: 'Phòng B-202', capacity: 24, status: ClassStatus.ACTIVE },
    { code: 'RKN1-01', courseCode: 'N1-CORE', teacherCode: 'GV006', name: 'Luyện thi JLPT N1', schedule: 'Thứ 3, 5 · 19:00', room: 'Phòng C-101', capacity: 20, status: ClassStatus.ACTIVE },
    { code: 'RKBIZ-01', courseCode: 'N2-GIAO-TIEP', teacherCode: 'GV008', name: 'Tiếng Nhật công sở · Tối', schedule: 'Thứ 2, 4 · 18:30', room: 'Phòng C-102', capacity: 22, status: ClassStatus.ACTIVE },
    { code: 'RKN4-05', courseCode: 'N4-CORE', teacherCode: 'GV008', name: 'Tiếng Nhật N4 · Khai giảng tháng tới', schedule: 'Thứ 2, 4, 6 · 18:30', room: 'Phòng A-206', capacity: 24, status: ClassStatus.UPCOMING },
    { code: 'RKN3-06', courseCode: 'N3-CORE', teacherCode: 'GV004', name: 'Tiếng Nhật N3 · Khai giảng tháng tới', schedule: 'Thứ 3, 5, 7 · 18:30', room: 'Phòng B-104', capacity: 26, status: ClassStatus.UPCOMING },
    { code: 'RKN5-00', courseCode: 'N5-CORE', teacherCode: 'GV003', name: 'Tiếng Nhật N5 · Đã hoàn thành', schedule: 'Thứ 2, 4, 6 · 18:30', room: 'Phòng A-103', capacity: 24, status: ClassStatus.COMPLETED },
  ];
  const classesByCode = new Map<string, Awaited<ReturnType<typeof prisma.class.upsert>>>();
  for (const [index, definition] of classDefinitions.entries()) {
    const course = coursesByCode.get(definition.courseCode);
    const teacher = teachersByCode.get(definition.teacherCode);
    if (!course || !teacher) throw new Error(`Missing course or teacher for ${definition.code}`);

    const startDate = definition.status === ClassStatus.UPCOMING
      ? addDays(today, 14 + (index - 10) * 7)
      : definition.status === ClassStatus.COMPLETED
        ? addDays(today, -210)
        : addDays(today, -42 - index * 2);
    const endDate = definition.status === ClassStatus.COMPLETED ? addDays(today, -30) : addDays(startDate, 90);
    classesByCode.set(definition.code, await prisma.class.upsert({
      where: { code: definition.code },
      update: {
        name: definition.name,
        courseId: course.id,
        teacherId: teacher.id,
        startDate,
        endDate,
        schedule: definition.schedule,
        room: definition.room,
        capacity: definition.capacity,
        status: definition.status,
        createdAt: daysAgo(90 + index * 3),
      },
      create: {
        code: definition.code,
        name: definition.name,
        courseId: course.id,
        teacherId: teacher.id,
        startDate,
        endDate,
        schedule: definition.schedule,
        room: definition.room,
        capacity: definition.capacity,
        status: definition.status,
        createdAt: daysAgo(90 + index * 3),
      },
    }));
  }

  const classList = [...classesByCode.values()];
  const assignmentDefinitions = [
    { title: 'Bài tập luyện tập tuần', description: 'Hoàn thành bài luyện tập và nộp file đáp án hoặc ảnh chụp bài làm.' },
    { title: 'Minh chứng thực hành hội thoại', description: 'Tải lên tài liệu chuẩn bị và hình ảnh minh chứng phần thực hành trên lớp.' },
  ];
  for (const [classIndex, classRoom] of classList.entries()) {
    for (const [assignmentIndex, definition] of assignmentDefinitions.entries()) {
      const dueAt = classRoom.status === ClassStatus.COMPLETED
        ? addDays(today, -30)
        : classRoom.status === ClassStatus.UPCOMING
          ? addDays(classRoom.startDate, 7 + assignmentIndex * 7)
          : assignmentIndex === 0
            ? addDays(today, (classIndex % 5) - 3)
            : addDays(today, 7 + (classIndex % 4) * 3);
      const existing = await prisma.assignment.findFirst({ where: { classId: classRoom.id, title: definition.title } });
      if (existing) {
        await prisma.assignment.update({ where: { id: existing.id }, data: { description: definition.description, dueAt } });
      } else {
        await prisma.assignment.create({ data: { classId: classRoom.id, title: definition.title, description: definition.description, dueAt } });
      }
    }
  }
  const studentByCode = new Map(students.map((student) => [student.studentCode, student]));
  const enrollmentData = new Map<string, {
    studentId: bigint;
    classId: bigint;
    status: EnrollmentStatus;
    enrolledAt: Date;
    leftAt: Date | null;
  }>();
  for (const [classIndex, classRoom] of classList.entries()) {
    const definition = classDefinitions[classIndex];
    const rosterSize = classRoom.status === ClassStatus.COMPLETED
      ? 14
      : classRoom.status === ClassStatus.UPCOMING
        ? 8 + (classIndex % 4)
        : 12 + ((classIndex * 3) % 9);
    for (let rosterIndex = 0; rosterIndex < rosterSize; rosterIndex += 1) {
      const student = students[(classIndex * 7 + rosterIndex) % students.length];
      const status = classRoom.status === ClassStatus.COMPLETED ? EnrollmentStatus.COMPLETED : EnrollmentStatus.ACTIVE;
      const key = `${student.id.toString()}:${classRoom.id.toString()}`;
      enrollmentData.set(key, {
        studentId: student.id,
        classId: classRoom.id,
        status,
        enrolledAt: addDays(today, -((classIndex + rosterIndex) % 55)),
        leftAt: status === EnrollmentStatus.COMPLETED ? addDays(today, -30) : null,
      });
    }
    if (definition.code === 'RKN4-01') {
      const primaryStudent = studentByCode.get('HV001');
      if (primaryStudent) {
        enrollmentData.set(`${primaryStudent.id.toString()}:${classRoom.id.toString()}`, {
          studentId: primaryStudent.id,
          classId: classRoom.id,
          status: EnrollmentStatus.ACTIVE,
          enrolledAt: addDays(today, -35),
          leftAt: null,
        });
      }
    }
  }
  if (enrollmentData.size > 0) {
    await prisma.enrollment.createMany({ data: [...enrollmentData.values()], skipDuplicates: true });
  }

  const classIds = classList.map((classRoom) => classRoom.id);
  const enrollments = await prisma.enrollment.findMany({
    where: { classId: { in: classIds }, status: { in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] } },
    select: { classId: true, studentId: true },
  });
  const rosterByClassId = new Map<string, bigint[]>();
  for (const enrollment of enrollments) {
    const key = enrollment.classId.toString();
    rosterByClassId.set(key, [...(rosterByClassId.get(key) ?? []), enrollment.studentId]);
  }

  const lessonTopics = [
    'Kaiwa: Giới thiệu bản thân',
    'Từ vựng theo chủ đề',
    'Ngữ pháp trọng tâm',
    'Đọc hiểu và suy luận',
    'Nghe hiểu hội thoại',
    'Luyện phản xạ giao tiếp',
    'Ôn tập giữa khóa',
    'Thực hành tình huống',
    'Chữa bài và giải đáp',
    'Tổng kết chuyên đề',
    'Luyện đề JLPT',
    'Đánh giá cuối khóa',
  ];
  const desiredLessons = new Map<string, {
    classId: bigint;
    title: string;
    lessonDate: Date;
    startTime: Date;
    endTime: Date;
    content: string;
    recordUrl: string | null;
    status: LessonStatus;
  }>();
  for (const classRoom of classList) {
    for (let lessonIndex = 0; lessonIndex < 12; lessonIndex += 1) {
      const lessonDate = addDays(classRoom.startDate, lessonIndex * 7);
      const completed = classRoom.status === ClassStatus.COMPLETED || lessonDate <= today;
      const title = classRoom.code === 'RKN4-01' && lessonIndex === 0
        ? 'Kaiwa: Giới thiệu bản thân'
        : `Buổi ${pad(lessonIndex + 1)}: ${lessonTopics[lessonIndex % lessonTopics.length]}`;
      desiredLessons.set(`${classRoom.id.toString()}:${title}`, {
        classId: classRoom.id,
        title,
        lessonDate,
        startTime: time(lessonIndex % 3 === 0 ? '09:00' : '18:30'),
        endTime: time(lessonIndex % 3 === 0 ? '10:30' : '20:00'),
        content: `Nội dung ${title.toLowerCase()} cho lớp ${classRoom.code}.`,
        recordUrl: completed && lessonIndex % 4 === 0 ? `https://example.com/records/${classRoom.code.toLowerCase()}-${lessonIndex + 1}.mp4` : null,
        status: completed ? LessonStatus.COMPLETED : LessonStatus.UPCOMING,
      });
    }
  }
  const existingLessons = await prisma.lesson.findMany({ where: { classId: { in: classIds } } });
  const existingLessonKeys = new Set(existingLessons.map((lesson) => `${lesson.classId.toString()}:${lesson.title}`));
  const missingLessons = [...desiredLessons.values()].filter((lesson) => !existingLessonKeys.has(`${lesson.classId.toString()}:${lesson.title}`));
  if (missingLessons.length > 0) await prisma.lesson.createMany({ data: missingLessons });
  const lessons = await prisma.lesson.findMany({ where: { classId: { in: classIds } }, orderBy: [{ lessonDate: 'asc' }, { startTime: 'asc' }] });

  const attendanceStatuses = [AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.LATE, AttendanceStatus.ABSENT, AttendanceStatus.PRESENT];
  const attendanceData: {
    lessonId: bigint;
    studentId: bigint;
    status: AttendanceStatus;
    note?: string;
  }[] = [];
  for (const lesson of lessons) {
    if (lesson.lessonDate > today && lesson.status !== LessonStatus.COMPLETED) continue;
    const roster = rosterByClassId.get(lesson.classId.toString()) ?? [];
    for (const [rosterIndex, studentId] of roster.entries()) {
      const status = attendanceStatuses[(Number(lesson.id % 6n) + rosterIndex) % attendanceStatuses.length];
      attendanceData.push({
        lessonId: lesson.id,
        studentId,
        status,
        note: status === AttendanceStatus.ABSENT ? 'Nghỉ có phép' : status === AttendanceStatus.LATE ? 'Đến muộn 10 phút' : undefined,
      });
    }
  }
  if (attendanceData.length > 0) await prisma.attendance.createMany({ data: attendanceData, skipDuplicates: true });

  const testNames = ['Bài kiểm tra từ vựng', 'Bài kiểm tra giữa khóa', 'Bài thi cuối khóa'];
  const testTypes = [TestType.QUIZ, TestType.MIDTERM, TestType.FINAL];
  const desiredTests = new Map<string, {
    classId: bigint;
    name: string;
    type: TestType;
    maxScore: number;
    testDate: Date;
  }>();
  for (const classRoom of classList) {
    for (let testIndex = 0; testIndex < testNames.length; testIndex += 1) {
      const name = classRoom.code === 'RKN4-01' && testIndex === 1 ? 'Bài kiểm tra giữa khóa' : testNames[testIndex];
      desiredTests.set(`${classRoom.id.toString()}:${name}`, {
        classId: classRoom.id,
        name,
        type: testTypes[testIndex],
        maxScore: 10,
        testDate: addDays(classRoom.startDate, 21 + testIndex * 21),
      });
    }
  }
  const existingTests = await prisma.test.findMany({ where: { classId: { in: classIds } } });
  const existingTestKeys = new Set(existingTests.map((test) => `${test.classId.toString()}:${test.name}`));
  const missingTests = [...desiredTests.values()].filter((test) => !existingTestKeys.has(`${test.classId.toString()}:${test.name}`));
  if (missingTests.length > 0) await prisma.test.createMany({ data: missingTests });
  const tests = await prisma.test.findMany({ where: { classId: { in: classIds } } });

  const scoreData: { testId: bigint; studentId: bigint; value: number; note?: string }[] = [];
  for (const test of tests) {
    if (!test.testDate || test.testDate > today) continue;
    const roster = rosterByClassId.get(test.classId.toString()) ?? [];
    for (const studentId of roster) {
      const studentIndex = studentIndexById.get(studentId.toString()) ?? 0;
      const value = Number((6 + ((studentIndex * 7 + Number(test.id % 37n)) % 40) / 10).toFixed(1));
      scoreData.push({
        testId: test.id,
        studentId,
        value: Math.min(value, 10),
        note: value >= 9 ? 'Bài làm tốt' : value < 6.5 ? 'Cần ôn tập thêm' : undefined,
      });
    }
  }
  if (scoreData.length > 0) await prisma.score.createMany({ data: scoreData, skipDuplicates: true });

  const academic = staffUsers.get('academic@riki.vn');
  if (academic) {
    const existingSeedAudit = await prisma.auditLog.findFirst({ where: { action: 'SEED', entity: 'DemoData', entityId: 'riki-lms' } });
    if (!existingSeedAudit) {
      await prisma.auditLog.createMany({
        data: [
          { actorId: academic.id, action: 'SEED', entity: 'DemoData', entityId: 'riki-lms', newValue: { students: students.length, teachers: teachersByCode.size, courses: coursesByCode.size, classes: classList.length }, createdAt: daysAgo(1) },
          { actorId: academic.id, action: 'CREATE', entity: 'Student', entityId: 'HV001', newValue: { source: 'demo-seed' }, createdAt: daysAgo(2) },
          { actorId: academic.id, action: 'CREATE', entity: 'Class', entityId: 'RKN4-01', newValue: { source: 'demo-seed' }, createdAt: daysAgo(3) },
          { actorId: academic.id, action: 'UPDATE', entity: 'Attendance', entityId: 'RKN4-01', newValue: { source: 'demo-seed' }, createdAt: daysAgo(4) },
        ],
      });
    }
  }

  const counts = await Promise.all([
    prisma.user.count(),
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.course.count(),
    prisma.class.count(),
    prisma.enrollment.count(),
    prisma.lesson.count(),
    prisma.attendance.count(),
    prisma.test.count(),
    prisma.score.count(),
    prisma.assignment.count(),
    prisma.auditLog.count(),
  ]);
  console.log(`Seeded Riki LMS demo data: student@riki.vn / ${demoPassword}`);
  console.log(`Counts: users=${counts[0]}, students=${counts[1]}, teachers=${counts[2]}, courses=${counts[3]}, classes=${counts[4]}, enrollments=${counts[5]}, lessons=${counts[6]}, attendance=${counts[7]}, tests=${counts[8]}, scores=${counts[9]}, assignments=${counts[10]}, auditLogs=${counts[11]}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => { await prisma.$disconnect(); });
