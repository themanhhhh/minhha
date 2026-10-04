import type { Attendance } from '@/types';
import { apiClient } from '@/lib/api-client';

export const attendanceService = {
  async getByLesson(lessonId: number): Promise<Attendance[]> {
    const response = await apiClient<{ data: Array<Attendance & { id?: string | null; studentId: string | number; lessonId: string | number; status: Attendance['status'] | null }> }>(`/lessons/${lessonId}/attendance`);
    return response.data.map((entry) => ({ ...entry, studentId: Number(entry.studentId), lessonId: Number(entry.lessonId), status: entry.status ?? 'ABSENT' }));
  },
  async update(lessonId: number, entries: Attendance[]) {
    const response = await apiClient<{ data: Attendance[] }>(`/lessons/${lessonId}/attendance`, { method: 'PUT', body: JSON.stringify({ entries: entries.map(({ studentId, status, note }) => ({ studentId: String(studentId), status, note })) }) });
    return response.data.map((entry) => ({ ...entry, studentId: Number(entry.studentId), lessonId: Number(entry.lessonId) }));
  },
};
