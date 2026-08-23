import type { AttendanceSummary, ScoreSummary } from '@/types';

export const mockAttendanceSummary: AttendanceSummary = { present: 7, absent: 1, late: 2, total: 10, participationRate: 90 };

export const mockScoreSummary: ScoreSummary = {
  average: 8.7,
  highest: 9.5,
  completedTests: 5,
  subjects: [{ name: 'Từ vựng', score: 8.8 }, { name: 'Ngữ pháp', score: 8.5 }, { name: 'Đọc hiểu', score: 9.1 }, { name: 'Nghe hiểu', score: 8.4 }],
  recent: [{ title: 'Bài kiểm tra giữa khóa', className: 'RKN4-01 · N4', score: 9.2, date: '18/08/2026' }, { title: 'Từ vựng bài 12-15', className: 'RKN4-01 · N4', score: 8.6, date: '11/08/2026' }, { title: 'Ngữ pháp bài 10', className: 'RKN4-01 · N4', score: 8.4, date: '04/08/2026' }],
};
