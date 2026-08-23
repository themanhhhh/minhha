import { dashboardStats } from '@/mocks/dashboard';
import type { DirectorOverview, DirectorReportData } from '@/types';

export const mockDirectorOverview: DirectorOverview = {
  stats: dashboardStats.DIRECTOR,
  monthlyStudents: [{ month: 'T1', students: 158, newStudents: 18 }, { month: 'T2', students: 172, newStudents: 22 }, { month: 'T3', students: 184, newStudents: 16 }, { month: 'T4', students: 201, newStudents: 27 }, { month: 'T5', students: 224, newStudents: 31 }, { month: 'T6', students: 248, newStudents: 32 }],
  levels: [{ level: 'N5', students: 62 }, { level: 'N4', students: 78 }, { level: 'N3', students: 54 }, { level: 'N2', students: 36 }, { level: 'N1', students: 18 }],
  attendance: [{ month: 'T1', rate: 88 }, { month: 'T2', rate: 90 }, { month: 'T3', rate: 89 }, { month: 'T4', rate: 91 }, { month: 'T5', rate: 93 }, { month: 'T6', rate: 92 }],
  teacherPerformance: [{ name: 'Phạm Nhật Nam', score: 4.9, classes: 4 }, { name: 'Nguyễn Hà My', score: 4.8, classes: 3 }, { name: 'Lê Minh Trang', score: 4.7, classes: 2 }, { name: 'Trần Hoàng Yến', score: 4.6, classes: 1 }],
  classOccupancy: [{ code: 'RKN4-01', occupancy: 90, students: 18, capacity: 20 }, { code: 'RKN3-03', occupancy: 87, students: 26, capacity: 30 }, { code: 'RKN5-02', occupancy: 88, students: 22, capacity: 25 }, { code: 'RKN2-01', occupancy: 75, students: 15, capacity: 20 }],
};

export const mockDirectorReports: DirectorReportData = {
  summary: [{ label: 'Tổng học viên', value: '248', note: '+8.4% so với kỳ trước' }, { label: 'Tỷ lệ chuyên cần', value: '92.4%', note: '+2.1% so với kỳ trước' }, { label: 'Điểm trung bình', value: '8.2', note: '+0.3 điểm so với kỳ trước' }, { label: 'Lấp đầy lớp', value: '84%', note: '+5.7% so với kỳ trước' }],
  studentByLevel: [{ level: 'N5', active: 62, newStudents: 12, completed: 18 }, { level: 'N4', active: 78, newStudents: 10, completed: 21 }, { level: 'N3', active: 54, newStudents: 6, completed: 14 }, { level: 'N2', active: 36, newStudents: 3, completed: 8 }, { level: 'N1', active: 18, newStudents: 1, completed: 5 }],
  classReport: [{ code: 'RKN4-01', course: 'Tiếng Nhật N4', teacher: 'Phạm Nhật Nam', students: 18, capacity: 20, attendance: 96 }, { code: 'RKN3-03', course: 'Tiếng Nhật N3', teacher: 'Nguyễn Hà My', students: 26, capacity: 30, attendance: 91 }, { code: 'RKN5-02', course: 'Tiếng Nhật N5', teacher: 'Lê Minh Trang', students: 22, capacity: 25, attendance: 94 }, { code: 'RKN2-01', course: 'Luyện thi JLPT N2', teacher: 'Trần Hoàng Yến', students: 15, capacity: 20, attendance: 88 }],
  teacherReport: [{ name: 'Phạm Nhật Nam', classes: 4, students: 44, attendance: 96, averageScore: 8.8 }, { name: 'Nguyễn Hà My', classes: 3, students: 58, attendance: 94, averageScore: 8.5 }, { name: 'Lê Minh Trang', classes: 2, students: 40, attendance: 92, averageScore: 8.3 }, { name: 'Trần Hoàng Yến', classes: 1, students: 15, attendance: 88, averageScore: 8.1 }],
};
