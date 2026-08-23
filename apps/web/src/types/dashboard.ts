export interface DashboardStat { label: string; value: string; change: string; trend: 'up' | 'neutral' | 'down'; icon: string; }
export interface DashboardActivity { title: string; description: string; time: string; type: 'success' | 'info' | 'warning'; }
