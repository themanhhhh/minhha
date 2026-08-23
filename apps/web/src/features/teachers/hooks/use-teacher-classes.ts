import { useQuery } from '@tanstack/react-query';
import { teacherClassService, type TeacherClassParams } from '@/services';

export function useTeacherClasses(params: TeacherClassParams) {
  return useQuery({ queryKey: ['teacher-classes', params], queryFn: () => teacherClassService.getAll(params) });
}
