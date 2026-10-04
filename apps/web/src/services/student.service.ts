import type { Student } from '@/types';
import { apiClient, type ApiRequest } from '@/lib/api-client';

export interface StudentListParams { search?: string; level?: string; status?: string; }
export interface ListResponse<T> { data: T[]; meta: { total: number; page: number; pageSize: number }; }

export const studentService = {
  async getAll(params: StudentListParams = {}, request: ApiRequest = apiClient): Promise<ListResponse<Student>> {
    const query = new URLSearchParams(Object.entries(params).filter(([, value]) => Boolean(value)) as [string, string][]);
    const response = await request<ListResponse<Student>>(`/students?${query.toString()}`);
    return { ...response, data: response.data.map((item) => ({ ...item, id: Number(item.id), currentLevel: item.currentLevel ?? 'N5', targetLevel: item.targetLevel ?? 'N5', className: item.className ?? 'Chưa xếp lớp', status: item.status === 'ACTIVE' ? 'ACTIVE' : 'WAITING' })) };
  },
  async getById(id: number, request: ApiRequest = apiClient) { const student = await request<Student>(`/students/${id}`); return student ? { ...student, id: Number(student.id), currentLevel: student.currentLevel ?? 'N5', targetLevel: student.targetLevel ?? 'N5', className: student.className ?? 'Chưa xếp lớp', status: student.status === 'ACTIVE' ? 'ACTIVE' : 'WAITING' } : null; },
};
