import { ResourceTable } from '@/features/academic/components/resource-table';
import { userAccountService } from '@/services';
import { serverApiClient } from '@/lib/server-api-client';

export default async function AcademicUsersPage() {
  const response = await userAccountService.getAll({}, serverApiClient);
  const rows = response.data.map((account) => ({ id: account.id, fullName: account.fullName, email: account.email, role: account.role, lastLogin: account.lastLogin, status: account.status }));
  return <ResourceTable title="Tài khoản người dùng" description="Quản lý tài khoản và quyền truy cập của hệ thống." actionLabel="Thêm tài khoản" rows={rows} columns={[{ key: 'fullName', label: 'Họ tên' }, { key: 'email', label: 'Email' }, { key: 'role', label: 'Vai trò' }, { key: 'lastLogin', label: 'Đăng nhập gần nhất' }, { key: 'status', label: 'Trạng thái' }]} statusKey="status" statusOptions={[{ value: 'ACTIVE', label: 'Hoạt động' }, { value: 'LOCKED', label: 'Đã khóa' }, { value: 'INACTIVE', label: 'Không hoạt động' }]} />;
}
