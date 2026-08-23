import type { ClassTheme } from './student-class';

export type TeacherClassStatus = 'ACTIVE' | 'COMPLETED' | 'UPCOMING';

export interface TeacherClass {
  id: number;
  code: string;
  name: string;
  section: string;
  schedule: string;
  room: string;
  studentCount: number;
  capacity: number;
  completedLessons: number;
  totalLessons: number;
  nextLesson: string;
  nextLessonTitle: string;
  attendancePending: boolean;
  pendingScores: number;
  status: TeacherClassStatus;
  theme: ClassTheme;
}
