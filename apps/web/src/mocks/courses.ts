import type { Course } from '@/types';

export const mockCourses: Course[] = [
  { id: 1, name: 'Tiếng Nhật N5', level: 'N5', lessons: 24, classCount: 4, tuition: '4.500.000đ', status: 'ACTIVE' },
  { id: 2, name: 'Tiếng Nhật N4', level: 'N4', lessons: 24, classCount: 5, tuition: '5.200.000đ', status: 'ACTIVE' },
  { id: 3, name: 'Tiếng Nhật N3', level: 'N3', lessons: 30, classCount: 6, tuition: '6.500.000đ', status: 'ACTIVE' },
  { id: 4, name: 'Luyện thi JLPT N2', level: 'N2', lessons: 20, classCount: 2, tuition: '7.000.000đ', status: 'ACTIVE' },
  { id: 5, name: 'Luyện thi JLPT N1', level: 'N1', lessons: 20, classCount: 0, tuition: '8.500.000đ', status: 'INACTIVE' },
];
