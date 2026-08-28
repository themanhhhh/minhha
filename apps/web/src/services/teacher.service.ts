import type { PaginatedResponse, Teacher } from '@/types';
import { mockTeachers } from '@/mocks/teachers';
import { apiClient, isMockMode } from '@/lib/api-client';
export const teacherService = { async getAll(): Promise<PaginatedResponse<Teacher>> { if (!isMockMode) return apiClient<PaginatedResponse<Teacher>>('/teachers'); return { data: mockTeachers, meta: { total: mockTeachers.length, page: 1, pageSize: 10 } }; }, async getById(id: number): Promise<Teacher | null> { if (!isMockMode) return apiClient<Teacher>(`/teachers/${id}`); return mockTeachers.find((teacher) => teacher.id === id) ?? null; } };
