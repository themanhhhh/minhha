import type { DirectorReportData, DirectorOverview } from '@/types';
import { apiClient, type ApiRequest } from '@/lib/api-client';

export interface DirectorReportFilters { period: string; level: string; classId: string; teacherId: string; }
export interface DirectorReportOptions { classes: { id: string; code: string; name: string }[]; teachers: { id: string; code: string; name: string }[]; }
export const directorService = {
  async getOverview(request: ApiRequest = apiClient): Promise<DirectorOverview> { return request<DirectorOverview>('/dashboard/director'); },
  async getFilters(request: ApiRequest = apiClient): Promise<DirectorReportOptions> { return request<DirectorReportOptions>('/reports/filters'); },
  async getReports(filters: DirectorReportFilters, request: ApiRequest = apiClient): Promise<DirectorReportData> { const query = new URLSearchParams(Object.entries({ period: filters.period, level: filters.level, classId: filters.classId, teacherId: filters.teacherId }).filter(([, value]) => value && value !== 'ALL') as [string, string][]); return request<DirectorReportData>(`/reports/classes?${query.toString()}`); },
};
