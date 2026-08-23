import { FeaturePage } from '@/components/common/feature-page';
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <FeaturePage role={`Lớp phụ trách · ${id}`} title="Chi tiết lớp học" description="Danh sách học viên, buổi học và kết quả của lớp." items={['Thông tin lớp', 'Học viên', 'Buổi học', 'Điểm danh', 'Điểm số']} />; }
