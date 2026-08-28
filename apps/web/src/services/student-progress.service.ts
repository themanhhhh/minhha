import { mockAttendanceSummary, mockScoreSummary } from '@/mocks/student-progress';
import { apiClient, isMockMode } from '@/lib/api-client';

export const studentProgressService = {
  async getAttendance() { if (!isMockMode) { const response = await apiClient<{ summary: typeof mockAttendanceSummary }>('/me/attendance'); return response.summary; } return mockAttendanceSummary; },
  async getScores() { if (!isMockMode) { const response = await apiClient<{ summary: { average: number; highest: number; completedTests: number } }>('/me/scores'); return { ...mockScoreSummary, ...response.summary, subjects: [], recent: [] }; } return mockScoreSummary; },
};
