import { TeacherProfile } from '@/features/teachers/components/teacher-profile';
import { teacherProfileService } from '@/services';

export default async function TeacherProfilePage() {
  const profile = await teacherProfileService.getCurrent();
  return <TeacherProfile profile={profile} />;
}
