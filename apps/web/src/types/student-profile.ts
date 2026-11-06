import type { JLPTLevel, StudentStatus } from './student';

export interface StudentProfile {
  id: number;
  code: string;
  fullName: string;
  gender: 'Nữ' | 'Nam' | 'Khác';
  dateOfBirth: string;
  email: string;
  phone: string;
  goal?: string | null;
  emergencyContact?: string | null;
  currentLevel: JLPTLevel | null;
  targetLevel: JLPTLevel | null;
  status: StudentStatus;
}
