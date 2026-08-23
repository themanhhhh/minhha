import { useQuery } from '@tanstack/react-query';
import { studentProgressService } from '@/services';

export function useStudentProgress() {
  const attendance = useQuery({ queryKey: ['student-progress', 'attendance'], queryFn: studentProgressService.getAttendance });
  const scores = useQuery({ queryKey: ['student-progress', 'scores'], queryFn: studentProgressService.getScores });
  return { attendance, scores };
}
