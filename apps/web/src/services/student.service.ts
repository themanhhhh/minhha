import { mockStudents } from '@/mocks/students';
import type { Student } from '@/types';
import { apiClient, isMockMode } from '@/lib/api-client';

export interface StudentListParams { search?: string; level?: string; status?: string; }
export interface ListResponse<T> { data: T[]; meta: { total: number; page: number; pageSize: number }; }

export const studentService = {
  async getAll(params: StudentListParams = {}): Promise<ListResponse<Student>> {
    if (!isMockMode) { const query = new URLSearchParams(Object.entries(params).filter(([, value]) => Boolean(value)) as [string, string][]); return apiClient<ListResponse<Student>>(`/students?${query.toString()}`); }
    const search = params.search?.toLowerCase().trim();
    const data = mockStudents.filter((student) => (!search || [student.fullName, student.code, student.email].some((value) => value.toLowerCase().includes(search))) && (!params.level || student.currentLevel === params.level) && (!params.status || student.status === params.status));
    return { data, meta: { total: data.length, page: 1, pageSize: 10 } };
  },
  async getById(id: number) { if (!isMockMode) return apiClient<Student>(`/students/${id}`); return mockStudents.find((student) => student.id === id) ?? null; },
};
