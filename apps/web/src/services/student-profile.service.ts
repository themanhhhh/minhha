import { apiClient, type ApiRequest } from '@/lib/api-client';
import type { StudentProfile } from '@/types';

export const studentProfileService = {
  async getCurrent(request: ApiRequest = apiClient): Promise<StudentProfile> {
    const profile = await request<{ id: string; code: string; fullName: string; gender?: string | null; dateOfBirth?: string | null; email: string; phone?: string | null; goal?: string | null; emergencyContact?: string | null; currentLevel?: StudentProfile['currentLevel'] | null; targetLevel?: StudentProfile['targetLevel'] | null; status?: StudentProfile['status'] }>('/me/profile');
    return { id: Number(profile.id), code: profile.code, fullName: profile.fullName, gender: profile.gender === 'Nữ' || profile.gender === 'Nam' ? profile.gender : 'Khác', dateOfBirth: profile.dateOfBirth?.slice(0, 10) ?? '', email: profile.email, phone: profile.phone ?? '', currentLevel: profile.currentLevel ?? null, targetLevel: profile.targetLevel ?? null, goal: profile.goal, emergencyContact: profile.emergencyContact, status: profile.status ?? 'WAITING' };
  },
};
