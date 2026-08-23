import type { DashboardStat } from './dashboard';

export interface DirectorOverview {
  stats: DashboardStat[];
  monthlyStudents: { month: string; students: number; newStudents: number }[];
  levels: { level: string; students: number }[];
  attendance: { month: string; rate: number }[];
  teacherPerformance: { name: string; score: number; classes: number }[];
  classOccupancy: { code: string; occupancy: number; students: number; capacity: number }[];
}

export interface DirectorReportData {
  summary: { label: string; value: string; note: string }[];
  studentByLevel: { level: string; active: number; newStudents: number; completed: number }[];
  classReport: { code: string; course: string; teacher: string; students: number; capacity: number; attendance: number }[];
  teacherReport: { name: string; classes: number; students: number; attendance: number; averageScore: number }[];
}
