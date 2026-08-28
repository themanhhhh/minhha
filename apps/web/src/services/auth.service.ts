import { mockLogin } from '@/mocks/auth';
import type { AuthUser, LoginResponse } from '@/types';
import { apiClient, isMockMode } from '@/lib/api-client';

const AUTH_KEY = 'riki-auth';
export const authService = {
  async login(email: string, password: string) {
    const response = isMockMode ? await mockLogin(email, password) : await apiClient<{ user: AuthUser }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }).then(({ user }) => ({ user, accessToken: '' }));
    if (typeof window !== 'undefined') localStorage.setItem(AUTH_KEY, JSON.stringify(response));
    return response;
  },
  getUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    try { return (JSON.parse(raw) as LoginResponse).user; } catch { return null; }
  },
  logout() { if (!isMockMode) void apiClient('/auth/logout', { method: 'POST' }).catch(() => undefined); if (typeof window !== 'undefined') localStorage.removeItem(AUTH_KEY); },
};
