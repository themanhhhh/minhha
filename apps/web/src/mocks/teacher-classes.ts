import type { TeacherClass } from '@/types';

export const mockTeacherClasses: TeacherClass[] = [
  { id: 1, code: 'RKN4-01', name: 'Tiếng Nhật N4', section: 'Giao tiếp nền tảng', schedule: 'Thứ 2, 4, 6 · 18:30', room: 'Phòng A-204', studentCount: 18, capacity: 20, completedLessons: 16, totalLessons: 24, nextLesson: 'Hôm nay · 18:30', nextLessonTitle: 'Kaiwa: Giới thiệu bản thân', attendancePending: true, pendingScores: 3, status: 'ACTIVE', theme: 'emerald' },
  { id: 2, code: 'RKN3-03', name: 'Tiếng Nhật N3', section: 'Ngữ pháp trung cấp', schedule: 'Thứ 3, 5, 7 · 19:00', room: 'Phòng B-102', studentCount: 26, capacity: 30, completedLessons: 12, totalLessons: 30, nextLesson: 'Ngày mai · 19:00', nextLessonTitle: '読解: Đọc hiểu đoạn văn', attendancePending: false, pendingScores: 5, status: 'ACTIVE', theme: 'violet' },
  { id: 3, code: 'RKN5-02', name: 'Tiếng Nhật N5', section: 'Nhập môn tiếng Nhật', schedule: 'Thứ 7, CN · 09:00', room: 'Phòng C-301', studentCount: 22, capacity: 25, completedLessons: 24, totalLessons: 24, nextLesson: 'Đã hoàn thành', nextLessonTitle: 'Khóa học đã hoàn thành', attendancePending: false, pendingScores: 0, status: 'COMPLETED', theme: 'amber' },
  { id: 4, code: 'RKN2-01', name: 'Luyện thi JLPT N2', section: 'Ôn thi mục tiêu N2', schedule: 'Thứ 2, 4 · 19:00', room: 'Phòng A-105', studentCount: 15, capacity: 20, completedLessons: 0, totalLessons: 20, nextLesson: '01/09/2026 · 19:00', nextLessonTitle: 'Buổi học đầu tiên', attendancePending: false, pendingScores: 0, status: 'UPCOMING', theme: 'rose' },
];
