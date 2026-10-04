import type { DashboardActivity, DashboardStat } from '@/types';
import { apiClient, type ApiRequest } from '@/lib/api-client';

export interface DashboardScheduleItem { id: string; date: string; title: string; detail: string; classCode: string; startTime: string; endTime: string; }
export interface DashboardOverview { stats: DashboardStat[]; schedule: DashboardScheduleItem[]; activities: DashboardActivity[]; monthlyStudents?: { month: string; students: number; newStudents: number }[]; }

export const dashboardService = {
  async getOverview(request: ApiRequest = apiClient): Promise<DashboardOverview> { return request<DashboardOverview>('/dashboard/me'); },
  async getStats(_role?: string, request: ApiRequest = apiClient) { return (await this.getOverview(request)).stats; },
  async getActivities(request: ApiRequest = apiClient) { return (await this.getOverview(request)).activities; },
};
