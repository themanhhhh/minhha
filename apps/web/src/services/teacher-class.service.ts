import { mockTeacherClasses } from '@/mocks/teacher-classes';
import { mockTeacherClassStudents } from '@/mocks/teacher-class-students';
import type { TeacherClass, TeacherClassStatus, TeacherClassStudent } from '@/types';

export interface TeacherClassParams { search?: string; status?: TeacherClassStatus | 'ALL'; }
export const teacherClassService = {
  async getAll(params: TeacherClassParams = {}): Promise<TeacherClass[]> {
    const search = params.search?.trim().toLowerCase();
    return mockTeacherClasses.filter((item) => (!search || [item.name, item.code, item.section].some((value) => value.toLowerCase().includes(search))) && (!params.status || params.status === 'ALL' || item.status === params.status));
  },
  async getById(id: number): Promise<TeacherClass | null> {
    return mockTeacherClasses.find((item) => item.id === id) ?? null;
  },
  async getStudents(classId: number): Promise<TeacherClassStudent[]> {
    return mockTeacherClassStudents[classId] ?? [];
  },
};
