import type { PaginatedResponse, Teacher } from '@/types';
import { mockTeachers } from '@/mocks/teachers';
export const teacherService = { async getAll(): Promise<PaginatedResponse<Teacher>> { return { data: mockTeachers, meta: { total: mockTeachers.length, page: 1, pageSize: 10 } }; }, async getById(id: number): Promise<Teacher | null> { return mockTeachers.find((teacher) => teacher.id === id) ?? null; } };
