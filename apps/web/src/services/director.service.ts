import { mockDirectorOverview, mockDirectorReports } from '@/mocks/director';
import type { DirectorReportData, DirectorOverview } from '@/types';
import { apiClient, isMockMode } from '@/lib/api-client';

export interface DirectorReportFilters { period: string; level: string; classCode: string; teacher: string; }
export const directorService = {
  async getOverview(): Promise<DirectorOverview> { if (!isMockMode) return apiClient<DirectorOverview>('/dashboard/director'); return mockDirectorOverview; },
  async getReports(filters: DirectorReportFilters): Promise<DirectorReportData> { if (!isMockMode) { const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value && value !== 'ALL') as [string, string][]); return apiClient<DirectorReportData>(`/reports/classes?${query.toString()}`); } return mockDirectorReports; },
};
