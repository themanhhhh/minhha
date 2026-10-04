import { notFound } from 'next/navigation';
import { StudentAssignmentDetail } from '@/features/students/components/student-assignment-detail';
import { studentClassService } from '@/services';
import type { ClassWork, StudentAssignment } from '@/types';
import { serverApiClient } from '@/lib/server-api-client';

export default async function StudentAssignmentPage({ params }: { params: Promise<{ id: string; assignmentId: string }> }) {
  const { id, assignmentId } = await params;
  const classId = Number(id);
  const classDetail = await studentClassService.getById(classId, serverApiClient);
  if (!classDetail) notFound();

  const assignment = classDetail.assignments?.find((item) => String(item.id) === assignmentId) ?? classDetail.works?.filter((work) => work.type === 'ASSIGNMENT').map(toAssignment).find((item) => String(item.id) === assignmentId);
  if (!assignment) notFound();

  const referenceMaterials = classDetail.materials?.length ? classDetail.materials : classDetail.works?.filter((work) => work.type === 'MATERIAL') ?? [];
  return <StudentAssignmentDetail initialAssignment={assignment} classId={classId} className={classDetail.name} referenceMaterials={referenceMaterials} />;
}

function toAssignment(work: ClassWork): StudentAssignment {
  return { id: work.id, title: work.title, description: work.description, dueAt: work.dueDate, status: work.status === 'COMPLETED' ? 'SUBMITTED' : 'PENDING', submission: null };
}
