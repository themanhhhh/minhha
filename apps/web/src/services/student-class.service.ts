import type { StudentAssignmentSubmission, StudentClass, StudentClassDetail, StudentClassStatus } from '@/types';
import { apiClient, type ApiRequest } from '@/lib/api-client';

export interface StudentClassParams { search?: string; status?: StudentClassStatus | 'ALL'; }

function mapClass(value: any): StudentClassDetail {
  return { ...value, id: Number(value.id), room: value.room ?? 'Chưa xếp phòng', completedLessons: value.completedLessons ?? 0, totalLessons: value.totalLessons ?? value.lessonCount ?? 0, nextLesson: value.nextLesson ?? 'Chưa có lịch', nextLessonTitle: value.nextLessonTitle ?? 'Chưa có lịch', theme: value.theme ?? 'emerald', announcements: value.announcements ?? [], people: (value.people ?? []).map((person: any) => ({ ...person, id: Number(person.id) })) };
}

export const studentClassService = {
  async getAll(params: StudentClassParams = {}, request: ApiRequest = apiClient): Promise<StudentClass[]> {
    const query = new URLSearchParams(Object.entries(params).filter(([, value]) => Boolean(value)) as [string, string][]);
    const response = await request<{ data: StudentClass[] }>(`/me/classes?${query.toString()}`);
    return response.data.map((item) => mapClass(item));
  },
  async getById(id: number, request: ApiRequest = apiClient): Promise<StudentClassDetail | null> {
    return mapClass(await request<StudentClassDetail>(`/me/classes/${id}`));
  },
  async submitAssignment(assignmentId: number | string, files: File[], note: string): Promise<StudentAssignmentSubmission> {
    const body = new FormData();
    files.forEach((file) => body.append('files', file));
    if (note.trim()) body.append('note', note.trim());
    const response = await apiClient<{ data: { submission?: StudentAssignmentSubmission } }>(`/me/assignments/${assignmentId}/submission`, { method: 'POST', body });
    if (!response.data.submission) throw new Error('API không trả về thông tin bài nộp.');
    return response.data.submission;
  },
};
