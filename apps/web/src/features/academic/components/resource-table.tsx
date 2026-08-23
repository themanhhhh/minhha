'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export type ResourceRow = { id: number; [key: string]: string | number };
export interface ResourceColumn { key: string; label: string; className?: string; }
interface ResourceTableProps { title: string; description: string; rows: ResourceRow[]; columns: ResourceColumn[]; actionLabel: string; hrefBase?: string; statusKey?: string; statusOptions?: { value: string; label: string }[]; }

const statusMeta: Record<string, { label: string; variant: BadgeProps['variant'] }> = { ACTIVE: { label: 'Hoạt động', variant: 'success' }, INACTIVE: { label: 'Ngừng hoạt động', variant: 'secondary' }, UPCOMING: { label: 'Sắp khai giảng', variant: 'warning' }, COMPLETED: { label: 'Đã hoàn thành', variant: 'secondary' }, LOCKED: { label: 'Đã khóa', variant: 'danger' }, STUDENT: { label: 'Học viên', variant: 'info' }, TEACHER: { label: 'Giáo viên', variant: 'success' }, ACADEMIC_STAFF: { label: 'Học vụ', variant: 'warning' }, DIRECTOR: { label: 'Giám đốc', variant: 'default' } };

export function ResourceTable({ title, description, rows, columns, actionLabel, hrefBase, statusKey, statusOptions }: ResourceTableProps) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const filteredRows = useMemo(() => rows.filter((row) => { const matchesSearch = !search || Object.values(row).some((value) => String(value).toLowerCase().includes(search.toLowerCase())); const matchesStatus = !status || !statusKey || String(row[statusKey]) === status; return matchesSearch && matchesStatus; }), [rows, search, status, statusKey]);
  return <><PageHeader eyebrow="Quản lý" title={title} description={description} action={{ label: actionLabel }} /><Card><CardContent className="p-4 sm:p-6"><div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="relative w-full lg:max-w-sm"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Tìm ${title.toLowerCase()}...`} className="pl-9" /></div><div className="flex flex-wrap gap-2">{statusOptions && <Select value={status} onChange={(event) => setStatus(event.target.value)} className="w-auto min-w-36"><option value="">Tất cả trạng thái</option>{statusOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</Select>}<button className="inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium text-slate-500 hover:bg-muted"><SlidersHorizontal className="size-4" />Bộ lọc</button></div></div><Table><TableHeader><TableRow>{columns.map((column) => <TableHead key={column.key} className={column.className}>{column.label}</TableHead>)}<TableHead className="text-right">Thao tác</TableHead></TableRow></TableHeader><TableBody>{filteredRows.length === 0 ? <TableRow><TableCell colSpan={columns.length + 1} className="h-32 text-center text-sm text-muted-foreground">Không tìm thấy dữ liệu phù hợp.</TableCell></TableRow> : filteredRows.map((row) => <TableRow key={row.id}>{columns.map((column) => <TableCell key={column.key} className={column.className}>{renderValue(row[column.key], column.key)}</TableCell>)}<TableCell className="text-right">{hrefBase ? <Link href={`${hrefBase}/${row.id}`} className="text-sm font-medium text-emerald-600 hover:underline">Xem chi tiết</Link> : <button className="text-sm font-medium text-emerald-600 hover:underline">Xem chi tiết</button>}</TableCell></TableRow>)}</TableBody></Table><div className="mt-5 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground"><span>{filteredRows.length} bản ghi</span><button className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600"><Plus className="size-4" />{actionLabel}</button></div></CardContent></Card></>;
}

function renderValue(value: string | number, key: string) { if (key === 'status' || key === 'role') { const meta = statusMeta[String(value)] ?? { label: String(value), variant: 'outline' as const }; return <Badge variant={meta.variant}>{meta.label}</Badge>; } return value; }
