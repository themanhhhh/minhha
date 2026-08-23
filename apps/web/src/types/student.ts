export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
export type StudentStatus = 'WAITING' | 'ACTIVE' | 'RESERVED' | 'COMPLETED';

export interface Student {
  id: number;
  code: string;
  fullName: string;
  email: string;
  phone?: string;
  currentLevel: JLPTLevel;
  targetLevel: JLPTLevel;
  className: string;
  status: StudentStatus;
  attendanceRate: number;
  averageScore: number;
}
