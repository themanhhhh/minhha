export interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  total: number;
  participationRate: number;
}

export interface ScoreSummary {
  average: number;
  grading?: { method: 'WEIGHTED' | 'UNCONFIGURED'; provisional: boolean; finalAverage: number | null };
  highest: number;
  completedTests: number;
  subjects: { name: string; score: number }[];
  recent: { title: string; className: string; score: number; date: string }[];
}
