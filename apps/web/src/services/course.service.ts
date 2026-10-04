import type { Course, PaginatedResponse } from '@/types';
import { apiClient, type ApiRequest } from '@/lib/api-client';
interface ApiCourse extends Omit<Course, 'id' | 'lessons'> { id: number | string; totalLessons?: number; lessons?: number; }
export const courseService = { async getAll(request: ApiRequest = apiClient): Promise<PaginatedResponse<Course>> { const response = await request<{ data: ApiCourse[]; meta: PaginatedResponse<Course>['meta'] }>('/courses'); return { ...response, data: response.data.map((course) => ({ ...course, id: Number(course.id), lessons: course.lessons ?? course.totalLessons ?? 0 })) }; } };
