import type { Lesson } from '@/types';
import { mockLessons } from '@/mocks/lessons';
export const lessonService = { async getAll(): Promise<Lesson[]> { return mockLessons; }, async getByClass(classId: number): Promise<Lesson[]> { return mockLessons.filter((lesson) => lesson.classId === classId); } };
