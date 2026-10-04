'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, ClipboardCheck, Clock3, Save, Search, UserRound, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTeacherClasses } from '@/features/teachers/hooks/use-teacher-classes';
import { teacherAssessmentService } from '@/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { AttendanceEntry } from '@/types';

type AttendanceStatus = AttendanceEntry['status'];
const statuses: { value: AttendanceStatus; label: string; icon: React.ReactNode }[] = [{ value: 'PRESENT', label: 'Có mặt', icon: <Check className="size-3.5" /> }, { value: 'ABSENT', label: 'Vắng', icon: <X className="size-3.5" /> }, { value: 'LATE', label: 'Đi muộn', icon: <Clock3 className="size-3.5" /> }];

export function TeacherAttendance({ initialClassId }: { initialClassId?: string } = {}) {
  const [classId, setClassId] = useState(initialClassId ?? '');
  const [lessonId, setLessonId] = useState('');
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<AttendanceEntry[]>([]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const { data: classes = [] } = useTeacherClasses({ status: 'ALL' });
  const lessonsQuery = useQuery({ queryKey: ['teacher-lessons', classId], queryFn: () => teacherAssessmentService.getLessons(Number(classId)) });
  const attendanceQuery = useQuery({ queryKey: ['teacher-attendance', lessonId], queryFn: () => teacherAssessmentService.getAttendance(Number(lessonId)), enabled: Boolean(lessonId) });
  useEffect(() => { if (lessonsQuery.data?.[0]) setLessonId(String(lessonsQuery.data[0].id)); }, [lessonsQuery.data]);
  useEffect(() => { if (attendanceQuery.data) setRows(attendanceQuery.data); }, [attendanceQuery.data]);
  const filteredRows = useMemo(() => rows.filter((row) => `${row.fullName} ${row.code}`.toLowerCase().includes(search.toLowerCase())), [rows, search]);
  const summary = useMemo(() => ({ present: rows.filter((row) => row.status === 'PRESENT').length, absent: rows.filter((row) => row.status === 'ABSENT').length, late: rows.filter((row) => row.status === 'LATE').length }), [rows]);
  const currentLesson = lessonsQuery.data?.find((lesson) => lesson.id === Number(lessonId));
  const selectedClass = classes.find((item) => item.id === Number(classId));

  useEffect(() => { if (!classId && classes[0]) setClassId(String(classes[0].id)); }, [classId, classes]);

  function setStatus(studentId: number, status: AttendanceStatus) { setSaved(false); setRows((current) => current.map((row) => row.studentId === studentId ? { ...row, status } : row)); }
  function setNote(studentId: number, note: string) { setSaved(false); setRows((current) => current.map((row) => row.studentId === studentId ? { ...row, note } : row)); }
  async function save() { setSaving(true); await teacherAssessmentService.updateAttendance(Number(lessonId), rows); setSaving(false); setSaved(true); }

  return <div className="mx-auto max-w-7xl"><div className="mb-7 flex flex-col gap-2"><div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-500"><ClipboardCheck className="size-3.5" />Giảng dạy</div><h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Điểm danh</h1><p className="text-sm text-slate-500">Cập nhật tình trạng tham dự của học viên theo từng buổi học.</p></div><Card className="mb-5 border-slate-200 shadow-sm"><CardContent className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-[1fr_1.4fr_auto] lg:items-end"><div className="space-y-2"><label className="text-xs font-medium text-slate-500">Lớp học</label><Select value={classId} onChange={(event) => { setClassId(event.target.value); setSaved(false); }}><option value="">Chọn lớp học</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}</Select></div><div className="space-y-2"><label className="text-xs font-medium text-slate-500">Buổi học</label><Select value={lessonId} onChange={(event) => { setLessonId(event.target.value); setSaved(false); }}><option value="">Chọn buổi học</option>{(lessonsQuery.data ?? []).map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.label} · {lesson.date}</option>)}</Select></div><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm học viên..." className="pl-9" /></div></CardContent></Card><div className="mb-5 grid gap-3 sm:grid-cols-3"><SummaryCard label="Có mặt" value={summary.present} tone="emerald" icon={<Check />} /><SummaryCard label="Vắng" value={summary.absent} tone="red" icon={<X />} /><SummaryCard label="Đi muộn" value={summary.late} tone="amber" icon={<Clock3 />} /></div><Card className="border-slate-200 shadow-sm"><CardHeader className="flex-row items-center justify-between border-b px-4 py-4 sm:px-6"><div><CardTitle className="text-base">{selectedClass?.code ?? 'Lớp học'} · Danh sách học viên</CardTitle><p className="mt-1 text-xs text-slate-500">{currentLesson?.label ?? 'Chưa chọn buổi học'} · {currentLesson?.date ?? ''}</p></div><Badge variant={saved ? 'success' : 'warning'}>{saved ? 'Đã lưu' : 'Chưa lưu'}</Badge></CardHeader><CardContent className="p-0">{attendanceQuery.isLoading ? <div className="space-y-3 p-5">{[1, 2, 3, 4].map((item) => <Skeleton className="h-14 w-full" key={item} />)}</div> : attendanceQuery.isError ? <div className="p-5 text-sm text-red-600">Không thể tải danh sách học viên.</div> : <Table><TableHeader><TableRow><TableHead>Học viên</TableHead><TableHead>Trạng thái</TableHead><TableHead className="min-w-48">Ghi chú</TableHead></TableRow></TableHeader><TableBody>{filteredRows.map((row) => <TableRow key={row.studentId}><TableCell><div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-600">{row.fullName.split(' ').slice(-2).map((part) => part[0]).join('')}</div><div><p className="font-medium text-slate-700">{row.fullName}</p><p className="text-xs text-slate-400">{row.code}</p></div></div></TableCell><TableCell><div className="flex flex-wrap gap-1.5">{statuses.map((item) => <button key={item.value} type="button" onClick={() => setStatus(row.studentId, item.value)} className={cn('inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors', row.status === item.value && item.value === 'PRESENT' && 'border-emerald-200 bg-emerald-50 text-emerald-600', row.status === item.value && item.value === 'ABSENT' && 'border-red-200 bg-red-50 text-red-600', row.status === item.value && item.value === 'LATE' && 'border-amber-200 bg-amber-50 text-amber-600', row.status !== item.value && 'border-slate-200 text-slate-400 hover:bg-slate-50')}>{item.icon}{item.label}</button>)}</div></TableCell><TableCell><Input value={row.note ?? ''} onChange={(event) => setNote(row.studentId, event.target.value)} placeholder="Thêm ghi chú..." className="h-9 min-w-44 text-xs" /></TableCell></TableRow>)}</TableBody></Table>}<div className="flex flex-col gap-3 border-t bg-slate-50/60 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><p className="text-xs text-slate-500"><UserRound className="mr-1 inline size-3.5" />{filteredRows.length} học viên hiển thị</p><Button onClick={save} disabled={saving || !lessonId}><Save className="size-4" />{saving ? 'Đang lưu...' : 'Lưu điểm danh'}</Button></div></CardContent></Card></div>;
}

function SummaryCard({ label, value, tone, icon }: { label: string; value: number; tone: 'emerald' | 'red' | 'amber'; icon: React.ReactNode }) { const colors = { emerald: 'bg-emerald-50 text-emerald-600', red: 'bg-red-50 text-red-600', amber: 'bg-amber-50 text-amber-600' }; return <Card><CardContent className="flex items-center gap-3 p-4"><div className={cn('grid size-9 place-items-center rounded-lg', colors[tone])}>{icon}</div><div><p className="text-xs text-slate-500">{label}</p><p className="mt-0.5 text-xl font-semibold text-slate-800">{value}</p></div></CardContent></Card>; }
