import type { TeacherClassContent } from '@/types';

export const mockTeacherClassContent: Record<number, TeacherClassContent> = {
  1: {
    assignments: [
      {
        id: 'mock-assignment-1',
        title: 'Bài tập luyện tập tuần',
        description: 'Hoàn thành bài luyện tập và nộp file đáp án trước hạn.',
        dueAt: '2026-09-30T11:30:00.000Z',
        submissionCount: 12,
        attachments: [{ id: 'mock-assignment-file-1', fileName: 'Bai-tap-tuan-17.pdf', mimeType: 'application/pdf', sizeBytes: 248000 }],
      },
    ],
    materials: [
      {
        id: 'mock-material-1',
        title: 'Tài liệu ngữ pháp bài 17',
        description: 'Slide và phần ghi chú dùng trong buổi học tiếp theo.',
        lessonId: 1,
        lessonTitle: 'Buổi 17 · Kaiwa: Giới thiệu bản thân',
        fileName: 'Ngu-phap-bai-17.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1840000,
      },
    ],
  },
};
