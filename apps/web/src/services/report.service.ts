import { apiClient } from '@/lib/api-client';

export interface ReportFilters { fromDate?: string; toDate?: string; level?: string; classId?: string; teacherId?: string; classCode?: string; teacherName?: string; }
export const reportService = {
  async getStudents(filters: ReportFilters = {}) { return apiClient(`/reports/students?${query(filters)}`); },
  async getTeachers(filters: ReportFilters = {}) { return apiClient(`/reports/teachers?${query(filters)}`); },
  async getClasses(filters: ReportFilters = {}) { return apiClient(`/reports/classes?${query(filters)}`); },
  async getAttendance(filters: ReportFilters = {}) { return apiClient(`/reports/attendance?${query(filters)}`); },
  async getScores(filters: ReportFilters = {}) { return apiClient(`/reports/scores?${query(filters)}`); },
};
function query(filters: ReportFilters) { return new URLSearchParams(Object.entries(filters).filter(([, value]) => value && value !== 'ALL') as [string, string][]).toString(); }
