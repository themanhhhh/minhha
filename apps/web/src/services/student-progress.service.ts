import { mockAttendanceSummary, mockScoreSummary } from '@/mocks/student-progress';

export const studentProgressService = {
  async getAttendance() { return mockAttendanceSummary; },
  async getScores() { return mockScoreSummary; },
};
