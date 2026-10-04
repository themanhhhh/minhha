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

export interface TeacherClassStudent {
  id: number;
  code: string;
  fullName: string;
  email: string;
  attendanceStatus: 'PRESENT' | 'ABSENT' | 'LATE' | null;
  latestScore: number | null;
}

export interface TeacherContentFile {
  id: number | string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  downloadUrl?: string;
}

export interface TeacherAssignment {
  id: number | string;
  title: string;
  description?: string | null;
  dueAt: string;
  submissionCount: number;
  attachments: TeacherContentFile[];
}

export interface TeacherMaterial extends TeacherContentFile {
  title: string;
  description?: string | null;
  lessonId?: number | string | null;
  lessonTitle?: string | null;
}

export interface TeacherClassContent {
  assignments: TeacherAssignment[];
  materials: TeacherMaterial[];
}

export interface CreateTeacherAssignmentInput {
  title: string;
  description: string;
  dueAt: string;
  files: File[];
}

export interface CreateTeacherMaterialInput {
  title: string;
  description: string;
  lessonId: string;
  file: File;
}
