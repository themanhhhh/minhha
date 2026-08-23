export type AccountRole = 'STUDENT' | 'TEACHER' | 'ACADEMIC_STAFF' | 'DIRECTOR';
export interface UserAccount { id: number; fullName: string; email: string; role: AccountRole; status: 'ACTIVE' | 'LOCKED' | 'INACTIVE'; lastLogin: string; }
