export type UserRole = 'STUDENT' | 'TEACHER' | 'ACADEMIC_STAFF' | 'DIRECTOR';

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  initials: string;
}

export interface LoginResponse { user: AuthUser; accessToken: string; }
