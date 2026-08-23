export interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  total: number;
  participationRate: number;
}

export interface ScoreSummary {
  average: number;
  highest: number;
  completedTests: number;
  subjects: { name: string; score: number }[];
  recent: { title: string; className: string; score: number; date: string }[];
}
