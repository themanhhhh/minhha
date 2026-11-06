export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
export type StudentStatus = 'WAITING' | 'ACTIVE' | 'RESERVED' | 'COMPLETED';

export interface Student {
  id: number;
  code: string;
  fullName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  goal?: string | null;
  emergencyContact?: string | null;
  accountStatus?: string;
  currentLevel: JLPTLevel | null;
  targetLevel: JLPTLevel | null;
  className: string;
  status: StudentStatus;
  attendanceRate: number;
  averageScore: number;
}
