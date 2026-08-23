import type { Teacher } from '@/types';

export const mockTeachers: Teacher[] = [
  { id: 1, code: 'GV001', fullName: 'Phạm Nhật Nam', email: 'nam.pham@riki.vn', phone: '0909876543', jlptLevel: 'N1', classCount: 4, status: 'ACTIVE' },
  { id: 2, code: 'GV002', fullName: 'Nguyễn Hà My', email: 'ha.my@riki.vn', phone: '0912345678', jlptLevel: 'N1', classCount: 3, status: 'ACTIVE' },
  { id: 3, code: 'GV003', fullName: 'Lê Minh Trang', email: 'minh.trang@riki.vn', phone: '0923456789', jlptLevel: 'N2', classCount: 2, status: 'ACTIVE' },
  { id: 4, code: 'GV004', fullName: 'Trần Hoàng Yến', email: 'hoang.yen@riki.vn', phone: '0934567890', jlptLevel: 'N1', classCount: 1, status: 'INACTIVE' },
];
