import { mockStudentProfile } from '@/mocks/student-profile';

export const studentProfileService = {
  async getCurrent() {
    return mockStudentProfile;
  },
};
