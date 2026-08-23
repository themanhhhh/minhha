export interface TeacherProfile {
  id: number;
  code: string;
  fullName: string;
  gender: 'Nữ' | 'Nam' | 'Khác';
  dateOfBirth: string;
  email: string;
  phone: string;
  jlptLevel: string;
  specialty: string;
  experienceYears: number;
  classCount: number;
  status: 'ACTIVE' | 'INACTIVE';
}
