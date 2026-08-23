import { mockTeacherClasses } from '@/mocks/teacher-classes';
import type { TeacherClass, TeacherClassStatus } from '@/types';

export interface TeacherClassParams { search?: string; status?: TeacherClassStatus | 'ALL'; }
export const teacherClassService = {
  async getAll(params: TeacherClassParams = {}): Promise<TeacherClass[]> {
    const search = params.search?.trim().toLowerCase();
    return mockTeacherClasses.filter((item) => (!search || [item.name, item.code, item.section].some((value) => value.toLowerCase().includes(search))) && (!params.status || params.status === 'ALL' || item.status === params.status));
  },
};
