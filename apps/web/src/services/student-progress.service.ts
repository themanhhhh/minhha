import { apiClient } from '@/lib/api-client';
import type { AttendanceSummary, ScoreSummary } from '@/types';

export const studentProgressService = {
  async getAttendance(): Promise<AttendanceSummary> { const response = await apiClient<{ summary: AttendanceSummary }>('/me/attendance'); return response.summary; },
  async getScores(): Promise<ScoreSummary> { const response = await apiClient<{ summary: Omit<ScoreSummary, 'subjects' | 'recent'>; data: Array<{ title: string; classCode: string; value: number; date: string | null }> }>('/me/scores'); return { ...response.summary, subjects: [], recent: response.data.map((item) => ({ title: item.title, className: item.classCode, score: item.value, date: item.date?.slice(0, 10) ?? '' })) }; },
};
