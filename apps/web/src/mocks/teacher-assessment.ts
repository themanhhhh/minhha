import type { AttendanceEntry, ScoreEntry, TeacherLessonOption, TeacherTestOption } from '@/types';

export const mockTeacherLessons: TeacherLessonOption[] = [
  { id: 1, classId: 1, label: 'Buổi 17 · Kaiwa: Giới thiệu bản thân', date: 'Hôm nay · 18:30' },
  { id: 2, classId: 1, label: 'Buổi 16 · Ngữ pháp bài 12', date: '16/08/2026 · 18:30' },
  { id: 3, classId: 2, label: 'Buổi 13 · Đọc hiểu đoạn văn', date: 'Ngày mai · 19:00' },
];

export const mockTeacherTests: TeacherTestOption[] = [
  { id: 1, classId: 1, label: 'Bài kiểm tra giữa khóa', date: '18/08/2026' },
  { id: 2, classId: 1, label: 'Từ vựng bài 12-15', date: '11/08/2026' },
  { id: 3, classId: 2, label: 'Ngữ pháp trung cấp · Bài 10', date: '04/08/2026' },
];

export const mockAttendanceEntries: AttendanceEntry[] = [
  { studentId: 1, code: 'HV001', fullName: 'Nguyễn Minh Anh', lessonId: 1, status: 'PRESENT', note: '' },
  { studentId: 2, code: 'HV002', fullName: 'Trần Hoàng Long', lessonId: 1, status: 'LATE', note: 'Đến muộn 10 phút' },
  { studentId: 3, code: 'HV003', fullName: 'Lê Khánh Linh', lessonId: 1, status: 'PRESENT', note: '' },
  { studentId: 4, code: 'HV004', fullName: 'Phạm Đức Anh', lessonId: 1, status: 'ABSENT', note: 'Xin nghỉ trước' },
  { studentId: 5, code: 'HV005', fullName: 'Vũ Ngọc Mai', lessonId: 1, status: 'PRESENT', note: '' },
  { studentId: 6, code: 'HV006', fullName: 'Đỗ Nhật Minh', lessonId: 1, status: 'PRESENT', note: '' },
];

export const mockScoreEntries: ScoreEntry[] = [
  { studentId: 1, testId: 1, code: 'HV001', fullName: 'Nguyễn Minh Anh', value: 9.2, note: '' },
  { studentId: 2, testId: 1, code: 'HV002', fullName: 'Trần Hoàng Long', value: 8.4, note: '' },
  { studentId: 3, testId: 1, code: 'HV003', fullName: 'Lê Khánh Linh', value: 9.5, note: 'Bài làm tốt' },
  { studentId: 4, testId: 1, code: 'HV004', fullName: 'Phạm Đức Anh', value: null, note: '' },
  { studentId: 5, testId: 1, code: 'HV005', fullName: 'Vũ Ngọc Mai', value: 8.8, note: '' },
  { studentId: 6, testId: 1, code: 'HV006', fullName: 'Đỗ Nhật Minh', value: 7.9, note: '' },
];
