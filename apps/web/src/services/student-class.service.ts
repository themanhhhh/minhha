import { mockStudentClasses } from '@/mocks/student-classes';
import type { StudentClass, StudentClassStatus } from '@/types';

export interface StudentClassParams { search?: string; status?: StudentClassStatus | 'ALL'; }

export const studentClassService = {
  async getAll(params: StudentClassParams = {}): Promise<StudentClass[]> {
    const search = params.search?.trim().toLowerCase();
    return mockStudentClasses.filter((item) => (!search || [item.name, item.code, item.teacherName, item.section].some((value) => value.toLowerCase().includes(search))) && (!params.status || params.status === 'ALL' || item.status === params.status));
  },
};
