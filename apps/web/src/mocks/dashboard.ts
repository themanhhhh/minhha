import type { DashboardActivity, DashboardStat } from '@/types';

export const dashboardStats: Record<string, DashboardStat[]> = {
  STUDENT: [{ label: 'Khóa đang học', value: '01', change: 'N4 giao tiếp', trend: 'neutral', icon: 'book' }, { label: 'Trình độ hiện tại', value: 'N4', change: 'Mục tiêu N3', trend: 'up', icon: 'target' }, { label: 'Tỷ lệ chuyên cần', value: '96%', change: '+4.2% tháng này', trend: 'up', icon: 'check' }, { label: 'Điểm trung bình', value: '8.7', change: '+0.5 điểm', trend: 'up', icon: 'chart' }],
  TEACHER: [{ label: 'Lớp phụ trách', value: '04', change: '32 học viên', trend: 'neutral', icon: 'book' }, { label: 'Buổi dạy tuần này', value: '12', change: '3 buổi hôm nay', trend: 'up', icon: 'calendar' }, { label: 'Chưa điểm danh', value: '02', change: 'Cần xử lý hôm nay', trend: 'down', icon: 'check' }, { label: 'Chưa nhập điểm', value: '08', change: '2 bài kiểm tra', trend: 'down', icon: 'chart' }],
  ACADEMIC_STAFF: [{ label: 'Tổng học viên', value: '248', change: '+12 tháng này', trend: 'up', icon: 'users' }, { label: 'Tổng giáo viên', value: '32', change: '+2 tháng này', trend: 'up', icon: 'user' }, { label: 'Lớp đang hoạt động', value: '28', change: '86% công suất', trend: 'neutral', icon: 'book' }, { label: 'Sắp khai giảng', value: '06', change: 'Trong 30 ngày tới', trend: 'neutral', icon: 'calendar' }],
  DIRECTOR: [{ label: 'Tổng học viên', value: '248', change: '+8.4% so với tháng trước', trend: 'up', icon: 'users' }, { label: 'Học viên mới', value: '32', change: '+12.5% tháng này', trend: 'up', icon: 'user' }, { label: 'Tỷ lệ chuyên cần', value: '92.4%', change: '+2.1% tháng này', trend: 'up', icon: 'check' }, { label: 'Tỷ lệ lấp đầy lớp', value: '84%', change: '+5.7% tháng này', trend: 'up', icon: 'chart' }],
};

export const recentActivities: DashboardActivity[] = [
  { title: 'Lớp RKN4-01 đã hoàn tất điểm danh', description: 'Phạm Nhật Nam · 18 học viên', time: '10 phút trước', type: 'success' },
  { title: 'Học viên mới được thêm vào hệ thống', description: 'Đỗ Nhật Minh · HV006', time: '1 giờ trước', type: 'info' },
  { title: 'Lớp RKN3-03 sắp đạt sĩ số tối đa', description: '28/30 học viên', time: '3 giờ trước', type: 'warning' },
];
