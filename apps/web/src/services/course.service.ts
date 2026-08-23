import type { Course, PaginatedResponse } from '@/types';
import { mockCourses } from '@/mocks/courses';
export const courseService = { async getAll(): Promise<PaginatedResponse<Course>> { return { data: mockCourses, meta: { total: mockCourses.length, page: 1, pageSize: 10 } }; } };
