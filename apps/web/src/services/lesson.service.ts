import type { Lesson } from '@/types';
import { apiClient, type ApiRequest } from '@/lib/api-client';

interface ApiLesson { id: string; classId: string; classCode?: string; className?: string; room?: string | null; title: string; lessonDate: string; startTime: string; endTime: string; status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED'; recordUrl?: string | null; }
const mapLesson = (lesson: ApiLesson): Lesson => ({ id: Number(lesson.id), classId: Number(lesson.classId), className: lesson.className ?? lesson.classCode, title: lesson.title, date: lesson.lessonDate.slice(0, 10), startTime: lesson.startTime, endTime: lesson.endTime, status: lesson.status === 'COMPLETED' ? 'COMPLETED' : 'UPCOMING', recordUrl: lesson.recordUrl ?? undefined, room: lesson.room });

export interface LessonRequestOptions { request?: ApiRequest; }
export const lessonService = { async getAll(options: LessonRequestOptions = {}): Promise<Lesson[]> { const response = await (options.request ?? apiClient)<{ data: ApiLesson[] }>('/lessons'); return response.data.map(mapLesson); }, async getByClass(classId: number, options: LessonRequestOptions = {}): Promise<Lesson[]> { const response = await (options.request ?? apiClient)<{ data: ApiLesson[] }>(`/classes/${classId}/lessons`); return response.data.map(mapLesson); } };
