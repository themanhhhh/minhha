import { TeacherProfile } from '@/features/teachers/components/teacher-profile';
import { teacherProfileService } from '@/services';
import { serverApiClient } from '@/lib/server-api-client';

export default async function TeacherProfilePage() {
  const profile = await teacherProfileService.getCurrent(serverApiClient);
  return <TeacherProfile profile={profile} />;
}
