import { StudentProfile } from '@/features/students/components/student-profile';
import { studentProfileService } from '@/services';

export default async function StudentProfilePage() {
  const profile = await studentProfileService.getCurrent();
  return <StudentProfile profile={profile} />;
}
