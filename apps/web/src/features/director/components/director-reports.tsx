'use client';

import { useState } from 'react';
import { Download, FileBarChart, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { directorService, type DirectorReportFilters } from '@/services';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const initialFilters: DirectorReportFilters = { period: 'this-month', level: 'ALL', classId: 'ALL', teacherId: 'ALL' };

export function DirectorReports() {
  const [filters, setFilters] = useState<DirectorReportFilters>(initialFilters);
  const optionsQuery = useQuery({ queryKey: ['director-report-filters'], queryFn: () => directorService.getFilters() });
  const reportQuery = useQuery({ queryKey: ['director-reports', filters], queryFn: () => directorService.getReports(filters) });
  const options = optionsQuery.data;

  function updateFilter(key: keyof DirectorReportFilters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return <div className="mx-auto max-w-7xl">
    <PageHeader eyebrow="Ban giám đốc" title="Báo cáo đào tạo" description="Phân tích dữ liệu học viên, lớp học, chuyên cần và kết quả học tập." action={{ label: 'Xuất báo cáo' }} />
    <Card className="mb-6 border-slate-200 shadow-sm">
      <CardContent className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:items-end">
        <Filter label="Thời gian"><Select value={filters.period} onChange={(event) => updateFilter('period', event.target.value)}><option value="this-month">Tháng này</option><option value="last-month">Tháng trước</option><option value="quarter">Quý này</option><option value="year">Năm nay</option></Select></Filter>
        <Filter label="Trình độ"><Select value={filters.level} onChange={(event) => updateFilter('level', event.target.value)}><option value="ALL">Tất cả trình độ</option>{['N5', 'N4', 'N3', 'N2', 'N1'].map((level) => <option value={level} key={level}>{level}</option>)}</Select></Filter>
        <Filter label="Lớp học"><Select value={filters.classId} onChange={(event) => updateFilter('classId', event.target.value)}><option value="ALL">Tất cả lớp</option>{options?.classes.map((item) => <option value={item.id} key={item.id}>{item.code} · {item.name}</option>)}</Select></Filter>
        <Filter label="Giáo viên"><Select value={filters.teacherId} onChange={(event) => updateFilter('teacherId', event.target.value)}><option value="ALL">Tất cả giáo viên</option>{options?.teachers.map((item) => <option value={item.id} key={item.id}>{item.code} · {item.name}</option>)}</Select></Filter>
        <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setFilters(initialFilters)}><RefreshCw className="size-4" />Đặt lại</Button><Button size="sm"><Download className="size-4" />Xuất</Button></div>
      </CardContent>
    </Card>
    {reportQuery.isLoading ? <ReportLoading /> : reportQuery.isError || !reportQuery.data ? <Card><CardContent className="p-10 text-center text-sm text-red-600">Không thể tải báo cáo. Vui lòng thử lại.</CardContent></Card> : <ReportContent data={reportQuery.data} />}
  </div>;
}

function ReportContent({ data }: { data: Awaited<ReturnType<typeof directorService.getReports>> }) {
  return <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{data.summary.map((item) => <Card key={item.label}><CardContent className="p-4"><p className="text-xs text-slate-400">{item.label}</p><p className="mt-1 text-2xl font-semibold text-slate-800">{item.value}</p><p className="mt-1 text-xs text-slate-500">{item.note}</p></CardContent></Card>)}</div>
    <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><FileBarChart className="size-4 text-emerald-500" />Hiệu suất theo lớp</CardTitle></CardHeader><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Lớp</TableHead><TableHead>Khóa học</TableHead><TableHead>Giáo viên</TableHead><TableHead>Sĩ số</TableHead><TableHead>Chuyên cần</TableHead></TableRow></TableHeader><TableBody>{data.classReport.map((item) => <TableRow key={item.code}><TableCell className="font-medium">{item.code}</TableCell><TableCell>{item.course}</TableCell><TableCell>{item.teacher}</TableCell><TableCell>{item.students}/{item.capacity}</TableCell><TableCell><Badge variant={item.attendance >= 80 ? 'success' : 'warning'}>{item.attendance}%</Badge></TableCell></TableRow>)}</TableBody></Table>{data.classReport.length === 0 && <p className="p-8 text-center text-sm text-slate-500">Không có dữ liệu lớp học phù hợp.</p>}</CardContent></Card>
    <Card><CardHeader><CardTitle className="text-base">Hiệu suất giáo viên</CardTitle></CardHeader><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Giáo viên</TableHead><TableHead>Lớp</TableHead><TableHead>Học viên</TableHead><TableHead>Chuyên cần</TableHead><TableHead>Điểm trung bình</TableHead></TableRow></TableHeader><TableBody>{data.teacherReport.map((item) => <TableRow key={item.name}><TableCell className="font-medium">{item.name}</TableCell><TableCell>{item.classes}</TableCell><TableCell>{item.students}</TableCell><TableCell>{item.attendance}%</TableCell><TableCell>{item.averageScore.toFixed(1)}</TableCell></TableRow>)}</TableBody></Table>{data.teacherReport.length === 0 && <p className="p-8 text-center text-sm text-slate-500">Không có dữ liệu giáo viên phù hợp.</p>}</CardContent></Card>
  </div>;
}

function ReportLoading() { return <div className="space-y-4"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <Skeleton className="h-24" key={item} />)}</div><Skeleton className="h-72" /><Skeleton className="h-64" /></div>; }
function Filter({ label, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-2"><label className="text-xs font-medium text-slate-500">{label}</label>{children}</div>; }
