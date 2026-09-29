import { notFound } from 'next/navigation';
import { TeacherClassDetail } from '@/features/teachers/components/teacher-class-detail';
import { teacherClassService } from '@/services';

export default async function TeacherClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const classData = await teacherClassService.getById(Number(id));
  if (!classData) notFound();
  return <TeacherClassDetail classData={classData} />;
}
