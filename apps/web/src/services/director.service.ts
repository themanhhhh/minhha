import { mockDirectorOverview, mockDirectorReports } from '@/mocks/director';
import type { DirectorReportData, DirectorOverview } from '@/types';

export interface DirectorReportFilters { period: string; level: string; classCode: string; teacher: string; }
export const directorService = {
  async getOverview(): Promise<DirectorOverview> { return mockDirectorOverview; },
  async getReports(_filters: DirectorReportFilters): Promise<DirectorReportData> { return mockDirectorReports; },
};
