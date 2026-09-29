import type { TeacherClassStudent } from '@/types';

export const mockTeacherClassStudents: Record<number, TeacherClassStudent[]> = {
  1: [
    { id: 1, code: 'HV001', fullName: 'Nguyễn Minh Anh', email: 'minhanh@example.com', attendanceStatus: 'PRESENT', latestScore: 9.2 },
    { id: 2, code: 'HV002', fullName: 'Trần Hoàng Long', email: 'hoanglong@example.com', attendanceStatus: 'LATE', latestScore: 8.4 },
    { id: 3, code: 'HV003', fullName: 'Lê Khánh Linh', email: 'khanhlinh@example.com', attendanceStatus: 'PRESENT', latestScore: 9.5 },
    { id: 4, code: 'HV004', fullName: 'Phạm Đức Anh', email: 'ducanh@example.com', attendanceStatus: 'ABSENT', latestScore: null },
    { id: 5, code: 'HV005', fullName: 'Vũ Ngọc Mai', email: 'ngocmai@example.com', attendanceStatus: 'PRESENT', latestScore: 8.8 },
    { id: 6, code: 'HV006', fullName: 'Đỗ Nhật Minh', email: 'nhatminh@example.com', attendanceStatus: 'PRESENT', latestScore: 7.9 },
    { id: 7, code: 'HV007', fullName: 'Nguyễn Hoàng Nam', email: 'hoangnam@example.com', attendanceStatus: 'PRESENT', latestScore: 8.6 },
    { id: 8, code: 'HV008', fullName: 'Trần Ngọc Anh', email: 'ngocanh@example.com', attendanceStatus: 'PRESENT', latestScore: 8.1 },
    { id: 9, code: 'HV009', fullName: 'Lê Minh Khang', email: 'minhkhang@example.com', attendanceStatus: 'LATE', latestScore: 7.8 },
    { id: 10, code: 'HV010', fullName: 'Phạm Khánh Vy', email: 'khanhvy@example.com', attendanceStatus: 'PRESENT', latestScore: 9.0 },
    { id: 11, code: 'HV011', fullName: 'Nguyễn Đức Duy', email: 'ducduy@example.com', attendanceStatus: 'PRESENT', latestScore: 8.3 },
    { id: 12, code: 'HV012', fullName: 'Hoàng Thu Trang', email: 'thutrang@example.com', attendanceStatus: 'ABSENT', latestScore: 7.5 },
    { id: 13, code: 'HV013', fullName: 'Vũ Thành Đạt', email: 'thanhdat@example.com', attendanceStatus: 'PRESENT', latestScore: 8.7 },
    { id: 14, code: 'HV014', fullName: 'Đặng Mai Phương', email: 'maiphuong@example.com', attendanceStatus: 'PRESENT', latestScore: 9.1 },
    { id: 15, code: 'HV015', fullName: 'Bùi Quang Huy', email: 'quanghuy@example.com', attendanceStatus: 'LATE', latestScore: 7.2 },
    { id: 16, code: 'HV016', fullName: 'Nguyễn Hà Linh', email: 'halinh@example.com', attendanceStatus: 'PRESENT', latestScore: 8.9 },
    { id: 17, code: 'HV017', fullName: 'Trịnh Quốc Bảo', email: 'quocbao@example.com', attendanceStatus: 'PRESENT', latestScore: 8.0 },
    { id: 18, code: 'HV018', fullName: 'Lý Ngọc Hà', email: 'ngocha@example.com', attendanceStatus: null, latestScore: null },
  ],
};
