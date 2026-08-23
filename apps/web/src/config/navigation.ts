import type { UserRole } from '@/types';

export interface NavItem { label: string; href: string; icon: string; }
export interface NavGroup { label: string; items: NavItem[]; }

export const roleLabels: Record<UserRole, string> = { STUDENT: 'Học viên', TEACHER: 'Giáo viên', ACADEMIC_STAFF: 'Chuyên viên học vụ', DIRECTOR: 'Ban giám đốc' };

export const navigationByRole: Record<UserRole, NavGroup[]> = {
  STUDENT: [
    { label: 'Tổng quan', items: [{ label: 'Dashboard', href: '/student/dashboard', icon: 'layout-dashboard' }] },
    { label: 'Học tập', items: [{ label: 'Lớp học của tôi', href: '/student/classes', icon: 'book-open' }, { label: 'Lịch học', href: '/student/schedule', icon: 'calendar-days' }, { label: 'Tiến độ học tập', href: '/student/progress', icon: 'chart-no-axes-combined' }] },
    { label: 'Tài khoản', items: [{ label: 'Hồ sơ cá nhân', href: '/student/profile', icon: 'user-round' }] },
  ],
  TEACHER: [
    { label: 'Tổng quan', items: [{ label: 'Dashboard', href: '/teacher/dashboard', icon: 'layout-dashboard' }] },
    { label: 'Giảng dạy', items: [{ label: 'Lớp phụ trách', href: '/teacher/classes', icon: 'book-open' }, { label: 'Điểm danh', href: '/teacher/attendance', icon: 'clipboard-check' }, { label: 'Nhập điểm', href: '/teacher/scores', icon: 'chart-no-axes-combined' }] },
    { label: 'Tài khoản', items: [{ label: 'Hồ sơ cá nhân', href: '/teacher/profile', icon: 'user-round' }] },
  ],
  ACADEMIC_STAFF: [
    { label: 'Tổng quan', items: [{ label: 'Dashboard', href: '/academic/dashboard', icon: 'layout-dashboard' }] },
    { label: 'Quản lý', items: [{ label: 'Học viên', href: '/academic/students', icon: 'users-round' }, { label: 'Giáo viên', href: '/academic/teachers', icon: 'graduation-cap' }, { label: 'Khóa học', href: '/academic/courses', icon: 'library' }, { label: 'Lớp học', href: '/academic/classes', icon: 'school' }, { label: 'Tài khoản', href: '/academic/users', icon: 'shield-check' }] },
    { label: 'Đào tạo', items: [{ label: 'Buổi học', href: '/academic/lessons', icon: 'calendar-days' }] },
  ],
  DIRECTOR: [
    { label: 'Tổng quan', items: [{ label: 'Dashboard', href: '/director/dashboard', icon: 'layout-dashboard' }] },
    { label: 'Phân tích', items: [{ label: 'Báo cáo đào tạo', href: '/director/reports', icon: 'chart-no-axes-combined' }] },
  ],
};
