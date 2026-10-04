import { StudentProfile } from '@/features/students/components/student-profile';
import { studentProfileService } from '@/services';
import { serverApiClient } from '@/lib/server-api-client';

export default async function StudentProfilePage() {
  const profile = await studentProfileService.getCurrent(serverApiClient);
  return <StudentProfile profile={profile} />;
}
