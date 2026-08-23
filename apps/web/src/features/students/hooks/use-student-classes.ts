import { useQuery } from '@tanstack/react-query';
import { studentClassService, type StudentClassParams } from '@/services';

export function useStudentClasses(params: StudentClassParams) {
  return useQuery({ queryKey: ['student-classes', params], queryFn: () => studentClassService.getAll(params) });
}
