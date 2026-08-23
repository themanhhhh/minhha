'use client';

import { useDeferredValue, useState } from 'react';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { Avatar } from '@/components/ui/avatar';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useStudents } from '@/features/students/hooks/use-students';
import type { Student, StudentStatus } from '@/types';

const statusMeta: Record<StudentStatus, { label: string; variant: BadgeProps['variant'] }> = {
  ACTIVE: { label: 'Đang học', variant: 'success' },
  RESERVED: { label: 'Bảo lưu', variant: 'warning' },
  WAITING: { label: 'Chờ xếp lớp', variant: 'info' },
  COMPLETED: { label: 'Hoàn thành', variant: 'secondary' },
};

function initials(name: string) { return name.split(' ').slice(-2).map((part) => part[0]).join(''); }

export function StudentManagement() {
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [level, setLevel] = useState('');
  const [status, setStatus] = useState('');
  const { data: response, isLoading: loading, isError, refetch } = useStudents({ search: deferredSearch, level, status });
  const students: Student[] = response?.data ?? [];

  return <>
    <PageHeader eyebrow="Quản lý" title="Học viên" description="Quản lý hồ sơ, lớp học và tiến độ của học viên." action={{ label: 'Thêm học viên' }} />
    <Card><CardContent className="p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="relative w-full lg:max-w-sm"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên, mã hoặc email..." className="pl-9" /></div><div className="flex flex-wrap gap-2"><Select value={level} onChange={(event) => setLevel(event.target.value)} className="w-auto min-w-28"><option value="">Tất cả trình độ</option><option value="N5">N5</option><option value="N4">N4</option><option value="N3">N3</option><option value="N2">N2</option><option value="N1">N1</option></Select><Select value={status} onChange={(event) => setStatus(event.target.value)} className="w-auto min-w-32"><option value="">Tất cả trạng thái</option><option value="ACTIVE">Đang học</option><option value="RESERVED">Bảo lưu</option><option value="WAITING">Chờ xếp lớp</option><option value="COMPLETED">Hoàn thành</option></Select><button className="inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium text-muted-foreground hover:bg-muted"><SlidersHorizontal className="size-4" />Bộ lọc</button></div></div>
      {loading ? <div className="space-y-3">{[1, 2, 3, 4].map((row) => <Skeleton className="h-14 w-full" key={row} />)}</div> : isError ? <ErrorState onRetry={() => void refetch()} /> : students.length === 0 ? <EmptyState title="Không tìm thấy học viên" description="Thử thay đổi từ khóa hoặc bộ lọc để xem thêm dữ liệu." /> : <Table><TableHeader><TableRow><TableHead>Học viên</TableHead><TableHead>Trình độ</TableHead><TableHead>Lớp</TableHead><TableHead>Chuyên cần</TableHead><TableHead>Trạng thái</TableHead><TableHead className="text-right">Thao tác</TableHead></TableRow></TableHeader><TableBody>{students.map((student) => <TableRow key={student.id}><TableCell><div className="flex items-center gap-3"><Avatar initials={initials(student.fullName)} /><div><p className="font-medium">{student.fullName}</p><p className="text-xs text-muted-foreground">{student.code} · {student.email}</p></div></div></TableCell><TableCell><span className="font-medium">{student.currentLevel}</span><span className="ml-1 text-xs text-muted-foreground">→ {student.targetLevel}</span></TableCell><TableCell>{student.className}</TableCell><TableCell>{student.attendanceRate ? `${student.attendanceRate}%` : '—'}</TableCell><TableCell><Badge variant={statusMeta[student.status].variant}>{statusMeta[student.status].label}</Badge></TableCell><TableCell className="text-right"><button className="text-sm font-medium text-emerald-600 hover:underline">Xem chi tiết</button></TableCell></TableRow>)}</TableBody></Table>}
      <div className="mt-5 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground"><span>{students.length} học viên</span><button className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600"><Plus className="size-4" />Thêm mới</button></div>
    </CardContent></Card>
  </>;
}
