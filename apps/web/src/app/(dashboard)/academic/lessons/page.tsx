import { ResourceTable } from '@/features/academic/components/resource-table';
import { lessonService } from '@/services';

export default async function AcademicLessonsPage() {
  const lessons = await lessonService.getAll();
  const rows = lessons.map((lesson) => ({ id: lesson.id, className: lesson.className ?? `Lớp ${lesson.classId}`, title: lesson.title, date: lesson.date, time: `${lesson.startTime} - ${lesson.endTime}`, record: lesson.recordUrl ? 'Đã có record' : 'Chưa cập nhật', status: lesson.status }));
  return <ResourceTable title="Buổi học" description="Quản lý nội dung, lịch học và record của từng buổi." actionLabel="Tạo buổi học" rows={rows} columns={[{ key: 'className', label: 'Lớp' }, { key: 'title', label: 'Tên buổi học' }, { key: 'date', label: 'Ngày học' }, { key: 'time', label: 'Thời gian' }, { key: 'record', label: 'Record' }, { key: 'status', label: 'Trạng thái' }]} statusKey="status" statusOptions={[{ value: 'UPCOMING', label: 'Sắp diễn ra' }, { value: 'COMPLETED', label: 'Đã hoàn thành' }]} />;
}
