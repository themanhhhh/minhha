import { ResourceTable } from '@/features/academic/components/resource-table';
import { courseService } from '@/services';

export default async function AcademicCoursesPage() {
  const response = await courseService.getAll();
  const rows = response.data.map((course) => ({ id: course.id, name: course.name, level: course.level, lessons: `${course.lessons} buổi`, tuition: course.tuition ?? '—', classCount: course.classCount, status: course.status }));
  return <ResourceTable title="Khóa học" description="Quản lý chương trình, trình độ JLPT và thời lượng đào tạo." actionLabel="Tạo khóa học" hrefBase="/academic/courses" rows={rows} columns={[{ key: 'name', label: 'Tên khóa học' }, { key: 'level', label: 'Trình độ' }, { key: 'lessons', label: 'Thời lượng' }, { key: 'tuition', label: 'Học phí' }, { key: 'classCount', label: 'Số lớp' }, { key: 'status', label: 'Trạng thái' }]} statusKey="status" statusOptions={[{ value: 'ACTIVE', label: 'Hoạt động' }, { value: 'INACTIVE', label: 'Ngừng hoạt động' }]} />;
}
