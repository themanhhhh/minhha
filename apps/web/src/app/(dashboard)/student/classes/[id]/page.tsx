import { StudentClassDetail } from '@/features/students/components/student-class-detail';
import { studentClassService } from '@/services';
import { serverApiClient } from '@/lib/server-api-client';
import { notFound } from 'next/navigation';

export default async function StudentClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const classDetail = await studentClassService.getById(Number(id), serverApiClient);
  if (!classDetail) notFound();
  return <StudentClassDetail classDetail={classDetail} />;
}
