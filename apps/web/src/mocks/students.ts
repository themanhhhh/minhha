import type { Student } from '@/types';

export const mockStudents: Student[] = [
  { id: 1, code: 'HV001', fullName: 'Nguyễn Minh Anh', email: 'minhanh@example.com', phone: '0901 234 567', currentLevel: 'N4', targetLevel: 'N3', className: 'RKN4-01', status: 'ACTIVE', attendanceRate: 96, averageScore: 8.7 },
  { id: 2, code: 'HV002', fullName: 'Trần Hoàng Long', email: 'hoanglong@example.com', phone: '0902 345 678', currentLevel: 'N3', targetLevel: 'N2', className: 'RKN3-03', status: 'RESERVED', attendanceRate: 88, averageScore: 7.9 },
  { id: 3, code: 'HV003', fullName: 'Lê Khánh Linh', email: 'khanhlinh@example.com', phone: '0903 456 789', currentLevel: 'N5', targetLevel: 'N4', className: 'RKN5-02', status: 'ACTIVE', attendanceRate: 100, averageScore: 9.1 },
  { id: 4, code: 'HV004', fullName: 'Phạm Đức Anh', email: 'ducanh@example.com', phone: '0904 567 890', currentLevel: 'N4', targetLevel: 'N3', className: 'RKN4-01', status: 'WAITING', attendanceRate: 0, averageScore: 0 },
  { id: 5, code: 'HV005', fullName: 'Vũ Ngọc Mai', email: 'ngocmai@example.com', phone: '0905 678 901', currentLevel: 'N2', targetLevel: 'N1', className: 'RKN2-01', status: 'COMPLETED', attendanceRate: 93, averageScore: 8.4 },
  { id: 6, code: 'HV006', fullName: 'Đỗ Nhật Minh', email: 'nhatminh@example.com', phone: '0906 789 012', currentLevel: 'N4', targetLevel: 'N3', className: 'RKN4-02', status: 'ACTIVE', attendanceRate: 91, averageScore: 8.1 },
];
