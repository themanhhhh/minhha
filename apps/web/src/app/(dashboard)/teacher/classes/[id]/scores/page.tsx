import { FeaturePage } from '@/components/common/feature-page';
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <FeaturePage role={`Điểm số · ${id}`} title="Điểm số lớp học" description="Nhập và quản lý điểm kiểm tra của học viên." items={['Chọn bài kiểm tra', 'Nhập điểm', 'Validate', 'Lưu kết quả']} />; }
