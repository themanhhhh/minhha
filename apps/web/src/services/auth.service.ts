import { mockLogin } from '@/mocks/auth';
import type { AuthUser, LoginResponse } from '@/types';

const AUTH_KEY = 'riki-auth';
export const authService = {
  async login(email: string, password: string) {
    const response = await mockLogin(email, password);
    if (typeof window !== 'undefined') localStorage.setItem(AUTH_KEY, JSON.stringify(response));
    return response;
  },
  getUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    try { return (JSON.parse(raw) as LoginResponse).user; } catch { return null; }
  },
  logout() { if (typeof window !== 'undefined') localStorage.removeItem(AUTH_KEY); },
};
