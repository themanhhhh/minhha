import { TeacherScores } from '@/features/teachers/components/teacher-scores';
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <TeacherScores initialClassId={id} />; }
