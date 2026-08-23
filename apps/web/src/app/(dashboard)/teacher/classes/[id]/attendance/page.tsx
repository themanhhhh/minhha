import { FeaturePage } from '@/components/common/feature-page';
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <FeaturePage role={`Điểm danh · ${id}`} title="Điểm danh buổi học" description="Cập nhật trạng thái tham dự của từng học viên." items={['Chọn buổi học', 'Có mặt', 'Vắng', 'Đi muộn', 'Ghi chú']} />; }
