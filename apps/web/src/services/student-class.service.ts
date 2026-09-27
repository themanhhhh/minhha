import { mockStudentClasses } from '@/mocks/student-classes';
import { mockStudentClassDetails } from '@/mocks/student-class-details';
import type { StudentAssignmentSubmission, StudentClass, StudentClassDetail, StudentClassStatus } from '@/types';
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
  async submitAssignment(assignmentId: number | string, files: File[], note: string): Promise<StudentAssignmentSubmission> {
    if (isMockMode) {
      return { status: 'SUBMITTED', submittedAt: new Date().toISOString(), note, files: files.map((file, index) => ({ id: `mock-${assignmentId}-${index}`, fileName: file.name, mimeType: file.type, sizeBytes: file.size })) };
    }
    const body = new FormData();
    files.forEach((file) => body.append('files', file));
    if (note.trim()) body.append('note', note.trim());
    const response = await apiClient<{ data: { submission?: StudentAssignmentSubmission } }>(`/me/assignments/${assignmentId}/submission`, { method: 'POST', body });
    if (!response.data.submission) throw new Error('API không trả về thông tin bài nộp.');
    return response.data.submission;
  },
};
