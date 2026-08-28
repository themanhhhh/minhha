import type { Course, PaginatedResponse } from '@/types';
import { mockCourses } from '@/mocks/courses';
import { apiClient, isMockMode } from '@/lib/api-client';
export const courseService = { async getAll(): Promise<PaginatedResponse<Course>> { if (!isMockMode) return apiClient<PaginatedResponse<Course>>('/courses'); return { data: mockCourses, meta: { total: mockCourses.length, page: 1, pageSize: 10 } }; } };
