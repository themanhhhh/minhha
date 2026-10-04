import { useQuery } from '@tanstack/react-query';
import { teacherClassService, type TeacherClassParams, type TeacherClassSourceOptions } from '@/services';

export function useTeacherClasses(params: TeacherClassParams, options: TeacherClassSourceOptions = {}) {
  return useQuery({ queryKey: ['teacher-classes', params, options], queryFn: () => teacherClassService.getAll(params, options) });
}
