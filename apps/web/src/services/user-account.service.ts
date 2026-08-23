import { mockUserAccounts } from '@/mocks/user-accounts';
import type { PaginatedResponse, UserAccount } from '@/types';
export const userAccountService = { async getAll(): Promise<PaginatedResponse<UserAccount>> { return { data: mockUserAccounts, meta: { total: mockUserAccounts.length, page: 1, pageSize: 10 } }; } };
