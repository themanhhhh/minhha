import type { JLPTLevel } from './student';

export type StudentClassStatus = 'ACTIVE' | 'COMPLETED' | 'UPCOMING';
export type ClassTheme = 'emerald' | 'violet' | 'amber' | 'rose' | 'sky';
export type StudentAssignmentStatus = 'PENDING' | 'OVERDUE' | 'SUBMITTED' | 'LATE';

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

export interface ClassAnnouncement { id: number; author: string; initials: string; message: string; time: string; }
export interface ClassWork { id: number; title: string; type: 'LESSON' | 'ASSIGNMENT' | 'MATERIAL'; description: string; dueDate: string; status: 'UPCOMING' | 'SUBMITTED' | 'COMPLETED'; }
export interface ClassPerson { id: number; fullName: string; initials: string; role: 'TEACHER' | 'STUDENT'; }
export interface StudentAssignmentFile { id: number | string; fileName: string; mimeType: string; sizeBytes: number; downloadUrl?: string; }
export interface StudentAssignmentSubmission { id?: number | string; note?: string | null; status: Exclude<StudentAssignmentStatus, 'PENDING' | 'OVERDUE'>; submittedAt: string; files: StudentAssignmentFile[]; }
export interface StudentAssignment { id: number | string; title: string; description?: string | null; dueAt: string; status: StudentAssignmentStatus; submission?: StudentAssignmentSubmission | null; }
export interface StudentClassDetail extends StudentClass { announcements: ClassAnnouncement[]; works?: ClassWork[]; assignments?: StudentAssignment[]; people: ClassPerson[]; }
