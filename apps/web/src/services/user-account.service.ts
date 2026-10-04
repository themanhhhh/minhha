import type { PaginatedResponse, UserAccount } from '@/types';
import { apiClient, type ApiRequest } from '@/lib/api-client';

export interface UserAccountParams { search?: string; role?: string; status?: string; page?: number; pageSize?: number; }
export const userAccountService = { async getAll(params: UserAccountParams = {}, request: ApiRequest = apiClient): Promise<PaginatedResponse<UserAccount>> { const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== '') as [string, string][]); const response = await request<{ data: Array<{ id: string; fullName: string; email: string; role: UserAccount['role']; status: UserAccount['status']; lastLogin: string | null }>; meta: PaginatedResponse<UserAccount>['meta'] }>(`/users${query.toString() ? `?${query.toString()}` : ''}`); return { data: response.data.map((account) => ({ ...account, id: Number(account.id), lastLogin: account.lastLogin ?? '' })), meta: response.meta }; } };
