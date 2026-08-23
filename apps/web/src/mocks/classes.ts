import type { ClassRoom } from '@/types';

export const mockClasses: ClassRoom[] = [
  { id: 1, code: 'RKN4-01', name: 'Tiếng Nhật N4 · Tối', courseName: 'Tiếng Nhật N4', teacherName: 'Phạm Nhật Nam', studentCount: 18, capacity: 20, status: 'ACTIVE' },
  { id: 2, code: 'RKN3-03', name: 'Tiếng Nhật N3 · Tối', courseName: 'Tiếng Nhật N3', teacherName: 'Nguyễn Hà My', studentCount: 26, capacity: 30, status: 'ACTIVE' },
  { id: 3, code: 'RKN5-02', name: 'Tiếng Nhật N5 · Cuối tuần', courseName: 'Tiếng Nhật N5', teacherName: 'Lê Minh Trang', studentCount: 22, capacity: 25, status: 'ACTIVE' },
  { id: 4, code: 'RKN2-01', name: 'Luyện thi N2 · Tối', courseName: 'Luyện thi JLPT N2', teacherName: 'Trần Hoàng Yến', studentCount: 15, capacity: 20, status: 'UPCOMING' },
  { id: 5, code: 'RKN4-02', name: 'Tiếng Nhật N4 · Sáng', courseName: 'Tiếng Nhật N4', teacherName: 'Phạm Nhật Nam', studentCount: 19, capacity: 20, status: 'ACTIVE' },
];
