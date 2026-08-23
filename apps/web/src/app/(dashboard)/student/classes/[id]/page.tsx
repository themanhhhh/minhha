import { StudentClassDetail } from '@/features/students/components/student-class-detail';
import { studentClassService } from '@/services';

export default async function StudentClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const classDetail = await studentClassService.getById(Number(id));
  if (!classDetail) return <StudentClassDetail classDetail={{ id: Number(id), code: 'RKN4-01', name: 'Tiếng Nhật N4', section: 'Giao tiếp nền tảng', level: 'N4', teacherName: 'Phạm Nhật Nam', teacherInitials: 'PN', schedule: 'Thứ 2, 4, 6 · 18:30', room: 'Phòng A-204', completedLessons: 16, totalLessons: 24, nextLesson: 'Hôm nay · 18:30', nextLessonTitle: 'Kaiwa: Giới thiệu bản thân', studentCount: 18, status: 'ACTIVE', theme: 'emerald', announcements: [], works: [], people: [] }} />;
  return <StudentClassDetail classDetail={classDetail} />;
}
