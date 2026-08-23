import type { Attendance } from '@/types';
export const attendanceService = { async getByLesson(_lessonId: number): Promise<Attendance[]> { return []; }, async update(_lessonId: number, entries: Attendance[]) { return entries; } };
