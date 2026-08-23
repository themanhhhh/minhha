import type { UserAccount } from '@/types';

export const mockUserAccounts: UserAccount[] = [
  { id: 1, fullName: 'Nguyễn Minh Anh', email: 'student@riki.vn', role: 'STUDENT', status: 'ACTIVE', lastLogin: 'Hôm nay, 08:42' },
  { id: 2, fullName: 'Phạm Nhật Nam', email: 'teacher@riki.vn', role: 'TEACHER', status: 'ACTIVE', lastLogin: 'Hôm nay, 09:15' },
  { id: 3, fullName: 'Lê Thu Hà', email: 'academic@riki.vn', role: 'ACADEMIC_STAFF', status: 'ACTIVE', lastLogin: 'Hôm nay, 08:30' },
  { id: 4, fullName: 'Trần Minh Quân', email: 'director@riki.vn', role: 'DIRECTOR', status: 'ACTIVE', lastLogin: 'Hôm qua, 17:10' },
  { id: 5, fullName: 'Nguyễn Văn Bình', email: 'binh.nguyen@riki.vn', role: 'TEACHER', status: 'LOCKED', lastLogin: '12/08/2026' },
];
