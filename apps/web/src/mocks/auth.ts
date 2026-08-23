import type { AuthUser, LoginResponse, UserRole } from '@/types';

const demoUsers: Record<string, AuthUser> = {
  'student@riki.vn': { id: 1, fullName: 'Nguyễn Minh Anh', email: 'student@riki.vn', role: 'STUDENT', initials: 'MA' },
  'teacher@riki.vn': { id: 2, fullName: 'Phạm Nhật Nam', email: 'teacher@riki.vn', role: 'TEACHER', initials: 'PN' },
  'academic@riki.vn': { id: 3, fullName: 'Lê Thu Hà', email: 'academic@riki.vn', role: 'ACADEMIC_STAFF', initials: 'LH' },
  'director@riki.vn': { id: 4, fullName: 'Trần Minh Quân', email: 'director@riki.vn', role: 'DIRECTOR', initials: 'TQ' },
};

export async function mockLogin(email: string, _password: string): Promise<LoginResponse> {
  await new Promise((resolve) => setTimeout(resolve, 350));
  const user = demoUsers[email.toLowerCase()];
  if (!user) throw new Error('Email demo không tồn tại. Hãy thử một trong bốn tài khoản mẫu.');
  return { user, accessToken: `mock-token-${user.role.toLowerCase()}` };
}

export function rolePath(role: UserRole) {
  return { STUDENT: '/student/dashboard', TEACHER: '/teacher/dashboard', ACADEMIC_STAFF: '/academic/dashboard', DIRECTOR: '/director/dashboard' }[role];
}
