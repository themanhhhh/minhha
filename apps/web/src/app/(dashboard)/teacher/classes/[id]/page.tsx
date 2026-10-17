import { notFound } from 'next/navigation';
import { TeacherClassDetail } from '@/features/teachers/components/teacher-class-detail';
import { TeacherClassContent } from '@/features/teachers/components/teacher-class-content';
import { teacherClassService } from '@/services';
import { serverApiClient } from '@/lib/server-api-client';
import { ClassBroadcastForm } from '@/features/notifications/components/class-broadcast-form';

export default async function TeacherClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const classData = await teacherClassService.getById(Number(id), { request: serverApiClient });
  if (!classData) notFound();
  return <div className="space-y-8"><ClassBroadcastForm classId={classData.id} /><TeacherClassContent classId={classData.id} /><TeacherClassDetail classData={classData} /></div>;
}
