import { mockAttendanceEntries, mockScoreEntries, mockTeacherLessons, mockTeacherTests } from '@/mocks/teacher-assessment';
import type { AttendanceEntry, ScoreEntry, TeacherLessonOption, TeacherTestOption } from '@/types';

export const teacherAssessmentService = {
  async getLessons(classId?: number): Promise<TeacherLessonOption[]> { return mockTeacherLessons.filter((lesson) => !classId || lesson.classId === classId); },
  async getTests(classId?: number): Promise<TeacherTestOption[]> { return mockTeacherTests.filter((test) => !classId || test.classId === classId); },
  async getAttendance(lessonId: number): Promise<AttendanceEntry[]> { return mockAttendanceEntries.map((entry) => ({ ...entry, lessonId })); },
  async updateAttendance(_lessonId: number, entries: AttendanceEntry[]) { return entries; },
  async getScores(testId: number): Promise<ScoreEntry[]> { return mockScoreEntries.map((entry) => ({ ...entry, testId })); },
  async updateScores(_testId: number, entries: ScoreEntry[]) { return entries; },
};
