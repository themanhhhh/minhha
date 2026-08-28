import { mockStudentClasses } from '@/mocks/student-classes';
import { mockStudentClassDetails } from '@/mocks/student-class-details';
import type { StudentClass, StudentClassDetail, StudentClassStatus } from '@/types';
import { apiClient, isMockMode } from '@/lib/api-client';

export interface StudentClassParams { search?: string; status?: StudentClassStatus | 'ALL'; }

export const studentClassService = {
  async getAll(params: StudentClassParams = {}): Promise<StudentClass[]> {
    if (!isMockMode) { const query = new URLSearchParams(Object.entries(params).filter(([, value]) => Boolean(value)) as [string, string][]); const response = await apiClient<{ data: StudentClass[] }>(`/me/classes?${query.toString()}`); return response.data; }
    const search = params.search?.trim().toLowerCase();
    return mockStudentClasses.filter((item) => (!search || [item.name, item.code, item.teacherName, item.section].some((value) => value.toLowerCase().includes(search))) && (!params.status || params.status === 'ALL' || item.status === params.status));
  },
  async getById(id: number): Promise<StudentClassDetail | null> {
    if (!isMockMode) return apiClient<StudentClassDetail>(`/me/classes/${id}`);
    return mockStudentClassDetails.find((item) => item.id === id) ?? (mockStudentClasses.find((item) => item.id === id) ? { ...mockStudentClasses.find((item) => item.id === id)!, announcements: [], works: [], people: [] } : null);
  },
};
