import type { Attendance, Score } from './resources';

export interface AttendanceEntry extends Attendance {
  code: string;
  fullName: string;
}

export interface ScoreEntry extends Omit<Score, 'value'> {
  code: string;
  fullName: string;
  value: number | null;
}

export interface TeacherLessonOption { id: number; classId: number; label: string; date: string; }
export interface TeacherTestOption { id: number; classId: number; label: string; date: string; }
