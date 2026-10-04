import type { Score } from '@/types';
import { apiClient } from '@/lib/api-client';

export const scoreService = {
  async getByClass(classId: number): Promise<Score[]> {
    const tests = await apiClient<{ data: Array<{ id: string }> }>(`/classes/${classId}/tests`);
    const responses = await Promise.all(tests.data.map((test) => apiClient<{ data: Array<{ studentId: string; testId: string; value: number | null; note?: string | null }> }>(`/tests/${test.id}/scores`)));
    return responses.flatMap((response) => response.data.filter((entry) => entry.value !== null).map((entry) => ({ studentId: Number(entry.studentId), testId: Number(entry.testId), value: Number(entry.value), note: entry.note ?? undefined })));
  },
  async update(testId: number, entries: Score[]) {
    const response = await apiClient<{ data: Array<{ studentId: string; testId: string; value: number | null; note?: string | null }> }>(`/tests/${testId}/scores`, { method: 'PUT', body: JSON.stringify({ entries: entries.map(({ studentId, value, note }) => ({ studentId: String(studentId), value, note })) }) });
    return response.data.filter((entry) => entry.value !== null).map((entry) => ({ studentId: Number(entry.studentId), testId: Number(entry.testId), value: Number(entry.value), note: entry.note ?? undefined }));
  },
};
