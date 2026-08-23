import type { JLPTLevel, StudentStatus } from './student';

export interface StudentProfile {
  id: number;
  code: string;
  fullName: string;
  gender: 'Nữ' | 'Nam' | 'Khác';
  dateOfBirth: string;
  email: string;
  phone: string;
  currentLevel: JLPTLevel;
  targetLevel: JLPTLevel;
  status: StudentStatus;
}
