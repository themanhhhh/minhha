import type { TeacherProfile } from '@/types';
import { apiClient, type ApiRequest } from '@/lib/api-client';

export const teacherProfileService = {
  async getCurrent(request: ApiRequest = apiClient): Promise<TeacherProfile> {
    const profile = await request<{ id: string; code: string; fullName: string; gender?: string | null; dateOfBirth?: string | null; email: string; phone?: string | null; jlptLevel?: string | null; specialty?: string | null; classCount: number; status: 'ACTIVE' | 'INACTIVE' | 'LOCKED' }>('/me/teacher-profile');
    return { id: Number(profile.id), code: profile.code, fullName: profile.fullName, gender: profile.gender === 'Nữ' || profile.gender === 'Nam' ? profile.gender : 'Khác', dateOfBirth: profile.dateOfBirth?.slice(0, 10) ?? '', email: profile.email, phone: profile.phone ?? '', jlptLevel: profile.jlptLevel ?? '-', specialty: profile.specialty ?? '-', experienceYears: 0, classCount: profile.classCount, status: profile.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE' };
  },
};
