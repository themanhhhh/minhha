import type { JLPTLevel } from './student';

export type StudentClassStatus = 'ACTIVE' | 'COMPLETED' | 'UPCOMING';
export type ClassTheme = 'emerald' | 'violet' | 'amber' | 'rose' | 'sky';

export interface StudentClass {
  id: number;
  code: string;
  name: string;
  section: string;
  level: JLPTLevel;
  teacherName: string;
  teacherInitials: string;
  schedule: string;
  room: string;
  completedLessons: number;
  totalLessons: number;
  nextLesson: string;
  nextLessonTitle: string;
  studentCount: number;
  status: StudentClassStatus;
  theme: ClassTheme;
}
