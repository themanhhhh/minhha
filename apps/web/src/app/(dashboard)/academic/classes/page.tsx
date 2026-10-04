import { ResourceTable } from '@/features/academic/components/resource-table';
import { classService } from '@/services';
import { serverApiClient } from '@/lib/server-api-client';

export default async function AcademicClassesPage() {
  const response = await classService.getAll(serverApiClient);
  const rows = response.data.map((item) => ({ id: item.id, code: item.code, name: item.name, courseName: item.courseName, teacherName: item.teacherName, capacity: `${item.studentCount}/${item.capacity}`, status: item.status }));
  return <ResourceTable title="Lớp học" description="Quản lý lớp, giáo viên, lịch học và sĩ số." actionLabel="Tạo lớp học" hrefBase="/academic/classes" rows={rows} columns={[{ key: 'code', label: 'Mã lớp' }, { key: 'name', label: 'Tên lớp' }, { key: 'courseName', label: 'Khóa học' }, { key: 'teacherName', label: 'Giáo viên' }, { key: 'capacity', label: 'Sĩ số' }, { key: 'status', label: 'Trạng thái' }]} statusKey="status" statusOptions={[{ value: 'ACTIVE', label: 'Đang hoạt động' }, { value: 'UPCOMING', label: 'Sắp khai giảng' }, { value: 'COMPLETED', label: 'Đã hoàn thành' }]} />;
}
