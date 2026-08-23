import type { Lesson } from '@/types';

export const mockLessons: Lesson[] = [
  { id: 1, classId: 1, className: 'RKN4-01', title: 'Kaiwa: Giới thiệu bản thân', date: '22/08/2026', startTime: '18:30', endTime: '20:00', status: 'UPCOMING', recordUrl: '' },
  { id: 2, classId: 2, className: 'RKN3-03', title: 'Đọc hiểu đoạn văn', date: '23/08/2026', startTime: '19:00', endTime: '20:30', status: 'UPCOMING', recordUrl: '' },
  { id: 3, classId: 3, className: 'RKN5-02', title: 'Ngữ pháp bài 12', date: '22/08/2026', startTime: '09:00', endTime: '10:30', status: 'COMPLETED', recordUrl: 'https://record.example.com/rkn5-02-12' },
  { id: 4, classId: 1, className: 'RKN4-01', title: 'Kanji bài 16', date: '24/08/2026', startTime: '18:30', endTime: '20:00', status: 'UPCOMING', recordUrl: '' },
];
