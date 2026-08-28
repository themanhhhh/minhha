import { mockStudentProfile } from '@/mocks/student-profile';
import { apiClient, isMockMode } from '@/lib/api-client';
import type { StudentProfile } from '@/types';

export const studentProfileService = {
  async getCurrent() {
    if (!isMockMode) return apiClient<StudentProfile>('/me/profile');
    return mockStudentProfile;
  },
};
