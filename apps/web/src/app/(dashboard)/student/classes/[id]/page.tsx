import { FeaturePage } from '@/components/common/feature-page';

export default async function StudentClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FeaturePage role={`Lớp học · ${id}`} title="Không gian lớp học" description="Tài liệu, thông báo, buổi học và tiến độ của lớp." items={['Bảng tin lớp', 'Bài học', 'Tài liệu', 'Bài tập', 'Điểm số']} />;
}
