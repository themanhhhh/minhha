import { mockTeacherProfile } from '@/mocks/teacher-profile';

export const teacherProfileService = {
  async getCurrent() {
    return mockTeacherProfile;
  },
};
