import { TeacherAttendance } from '@/features/teachers/components/teacher-attendance';
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <TeacherAttendance initialClassId={id} />; }
