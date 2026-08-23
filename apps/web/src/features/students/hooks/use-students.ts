import { useQuery } from '@tanstack/react-query';
import { studentService, type StudentListParams } from '@/services';
export function useStudents(params: StudentListParams) { return useQuery({ queryKey: ['students', params], queryFn: () => studentService.getAll(params) }); }
