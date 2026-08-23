import type { ClassRoom, PaginatedResponse } from '@/types';
import { mockClasses } from '@/mocks/classes';
export const classService = { async getAll(): Promise<PaginatedResponse<ClassRoom>> { return { data: mockClasses, meta: { total: mockClasses.length, page: 1, pageSize: 10 } }; }, async getById(id: number): Promise<ClassRoom | null> { return mockClasses.find((item) => item.id === id) ?? null; } };
