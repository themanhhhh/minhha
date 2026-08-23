import { dashboardStats, recentActivities } from '@/mocks/dashboard';
export const dashboardService = { async getStats(role: string) { return dashboardStats[role] ?? []; }, async getActivities() { return recentActivities; } };
