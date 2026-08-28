import type { ClassRoom, PaginatedResponse } from '@/types';
import { mockClasses } from '@/mocks/classes';
import { apiClient, isMockMode } from '@/lib/api-client';
export const classService = { async getAll(): Promise<PaginatedResponse<ClassRoom>> { if (!isMockMode) return apiClient<PaginatedResponse<ClassRoom>>('/classes'); return { data: mockClasses, meta: { total: mockClasses.length, page: 1, pageSize: 10 } }; }, async getById(id: number): Promise<ClassRoom | null> { if (!isMockMode) return apiClient<ClassRoom>(`/classes/${id}`); return mockClasses.find((item) => item.id === id) ?? null; } };
