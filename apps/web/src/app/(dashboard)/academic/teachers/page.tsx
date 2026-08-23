import { ResourceTable } from '@/features/academic/components/resource-table';
import { teacherService } from '@/services';

export default async function AcademicTeachersPage() {
  const response = await teacherService.getAll();
  const rows = response.data.map((teacher) => ({ id: teacher.id, code: teacher.code, fullName: teacher.fullName, email: teacher.email, jlptLevel: teacher.jlptLevel, classCount: teacher.classCount, status: teacher.status }));
  return <ResourceTable title="Giáo viên" description="Quản lý hồ sơ, trình độ và các lớp đang phụ trách." actionLabel="Thêm giáo viên" hrefBase="/academic/teachers" rows={rows} columns={[{ key: 'code', label: 'Mã GV' }, { key: 'fullName', label: 'Họ tên' }, { key: 'email', label: 'Email' }, { key: 'jlptLevel', label: 'Trình độ' }, { key: 'classCount', label: 'Lớp phụ trách' }, { key: 'status', label: 'Trạng thái' }]} statusKey="status" statusOptions={[{ value: 'ACTIVE', label: 'Hoạt động' }, { value: 'INACTIVE', label: 'Ngừng hoạt động' }]} />;
}
