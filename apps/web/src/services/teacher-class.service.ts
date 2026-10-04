import type { CreateTeacherAssignmentInput, CreateTeacherMaterialInput, TeacherAssignment, TeacherClass, TeacherClassContent, TeacherClassStatus, TeacherClassStudent, TeacherMaterial } from '@/types';
import { apiClient, type ApiRequest } from '@/lib/api-client';

export interface TeacherClassParams { search?: string; status?: TeacherClassStatus | 'ALL'; }
export interface TeacherClassSourceOptions { forceApi?: boolean; request?: ApiRequest; }
export const teacherClassService = {
  async getAll(params: TeacherClassParams = {}, options: TeacherClassSourceOptions = {}): Promise<TeacherClass[]> {
    const response = await (options.request ?? apiClient)<{ data: Array<Omit<TeacherClass, 'id'> & { id: number | string }> }>('/teacher/classes');
    const search = params.search?.trim().toLowerCase();
    return response.data.map((item) => ({ ...item, id: Number(item.id) })).filter((item) => (!search || [item.name, item.code, item.section].some((value) => value.toLowerCase().includes(search))) && (!params.status || params.status === 'ALL' || item.status === params.status));
  },
  async getById(id: number, options: TeacherClassSourceOptions = {}): Promise<TeacherClass | null> {
    const response = await (options.request ?? apiClient)<{ data: Omit<TeacherClass, 'id'> & { id: number | string } }>(`/teacher/classes/${id}`);
    return { ...response.data, id: Number(response.data.id) };
  },
  async getStudents(classId: number, options: TeacherClassSourceOptions = {}): Promise<TeacherClassStudent[]> {
    const response = await (options.request ?? apiClient)<{ data: Array<Omit<TeacherClassStudent, 'id'> & { id: number | string }> }>(`/teacher/classes/${classId}/students`);
    return response.data.map((student) => ({ ...student, id: Number(student.id) }));
  },
  async getContent(classId: number): Promise<TeacherClassContent> {
    const response = await apiClient<{ data: TeacherClassContent }>(`/teacher/classes/${classId}/content`);
    return response.data;
  },
  async createAssignment(classId: number, input: CreateTeacherAssignmentInput): Promise<TeacherAssignment> {
    const body = new FormData();
    body.append('title', input.title);
    body.append('description', input.description);
    body.append('dueAt', input.dueAt);
    input.files.forEach((file) => body.append('files', file));
    const response = await apiClient<{ data: TeacherAssignment }>(`/teacher/classes/${classId}/assignments`, { method: 'POST', body });
    return response.data;
  },
  async createMaterial(classId: number, input: CreateTeacherMaterialInput): Promise<TeacherMaterial> {
    const body = new FormData();
    body.append('title', input.title);
    body.append('description', input.description);
    if (input.lessonId) body.append('lessonId', input.lessonId);
    body.append('files', input.file);
    const response = await apiClient<{ data: TeacherMaterial }>(`/teacher/classes/${classId}/materials`, { method: 'POST', body });
    return response.data;
  },
  async deleteAssignment(classId: number, assignmentId: number | string): Promise<void> {
    await apiClient(`/teacher/assignments/${assignmentId}`, { method: 'DELETE' });
  },
  async deleteMaterial(classId: number, materialId: number | string): Promise<void> {
    await apiClient(`/teacher/materials/${materialId}`, { method: 'DELETE' });
  },
};
