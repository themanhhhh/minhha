'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, BarChart3, Check, Save, Search, Star, UserRound } from 'lucide-react';
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
import type { ScoreEntry } from '@/types';

export function TeacherScores({ initialClassId }: { initialClassId?: string } = {}) {
  const [classId, setClassId] = useState(initialClassId ?? '');
  const [testId, setTestId] = useState('');
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<ScoreEntry[]>([]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const { data: classes = [] } = useTeacherClasses({ status: 'ALL' }, { forceApi: true });
  const testsQuery = useQuery({ queryKey: ['teacher-tests', classId], queryFn: () => teacherAssessmentService.getTests(Number(classId), { forceApi: true }), enabled: Boolean(classId) });
  const scoresQuery = useQuery({ queryKey: ['teacher-scores', testId], queryFn: () => teacherAssessmentService.getScores(Number(testId), { forceApi: true }), enabled: Boolean(testId) });
  useEffect(() => { if (!classId && classes[0]) setClassId(String(classes[0].id)); }, [classId, classes]);
  useEffect(() => { if (testsQuery.data?.length && !testsQuery.data.some((test) => String(test.id) === testId)) setTestId(String(testsQuery.data[0].id)); if (!testsQuery.data?.length) setTestId(''); }, [testId, testsQuery.data]);
  useEffect(() => { setRows(scoresQuery.data ?? []); }, [scoresQuery.data]);
  const filteredRows = useMemo(() => rows.filter((row) => `${row.fullName} ${row.code}`.toLowerCase().includes(search.toLowerCase())), [rows, search]);
  const submitted = rows.filter((row) => row.value !== null).length;
  const average = submitted ? (rows.reduce((total, row) => total + (row.value ?? 0), 0) / submitted).toFixed(1) : '—';
  const hasInvalid = rows.some((row) => row.value !== null && (row.value < 0 || row.value > 10));
  const currentTest = testsQuery.data?.find((test) => test.id === Number(testId));
  const selectedClass = classes.find((item) => item.id === Number(classId));

  function setScore(studentId: number, value: string) { setSaved(false); const parsed = value === '' ? null : Number(value); setRows((current) => current.map((row) => row.studentId === studentId ? { ...row, value: Number.isNaN(parsed) ? null : parsed } : row)); }
  function setNote(studentId: number, note: string) { setSaved(false); setRows((current) => current.map((row) => row.studentId === studentId ? { ...row, note } : row)); }
  async function save() { if (!testId || hasInvalid || !rows.length) return; setSaving(true); try { const savedRows = await teacherAssessmentService.updateScores(Number(testId), rows, { forceApi: true }); setRows(savedRows); setSaved(true); } catch (error) { window.alert(error instanceof Error ? error.message : 'Không thể lưu bảng điểm. Vui lòng thử lại.'); } finally { setSaving(false); } }

  return <div className="mx-auto max-w-7xl"><div className="mb-7 flex flex-col gap-2"><div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-500"><BarChart3 className="size-3.5" />Giảng dạy</div><h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Nhập điểm</h1><p className="text-sm text-slate-500">Nhập, kiểm tra và lưu kết quả học tập của học viên.</p></div><Card className="mb-5 border-slate-200 shadow-sm"><CardContent className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-[1fr_1.4fr_auto] lg:items-end"><div className="space-y-2"><label className="text-xs font-medium text-slate-500">Lớp học</label><Select value={classId} onChange={(event) => { setClassId(event.target.value); setSaved(false); }}><option value="">Chọn lớp học</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}</Select></div><div className="space-y-2"><label className="text-xs font-medium text-slate-500">Bài kiểm tra</label><Select value={testId} onChange={(event) => { setTestId(event.target.value); setSaved(false); }}><option value="">Chọn bài kiểm tra</option>{(testsQuery.data ?? []).map((test) => <option key={test.id} value={test.id}>{test.label} · {test.date}</option>)}</Select></div><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm học viên..." className="pl-9" /></div></CardContent></Card><div className="mb-5 grid gap-3 sm:grid-cols-3"><ScoreSummary label="Đã nhập điểm" value={`${submitted}/${rows.length}`} icon={<Check />} tone="emerald" /><ScoreSummary label="Điểm trung bình" value={average} icon={<Star />} tone="amber" /><ScoreSummary label="Chưa nhập" value={String(rows.length - submitted)} icon={<AlertCircle />} tone="slate" /></div><Card className="border-slate-200 shadow-sm"><CardHeader className="flex-row items-center justify-between border-b px-4 py-4 sm:px-6"><div><CardTitle className="text-base">{selectedClass?.code ?? 'Lớp học'} · Bảng điểm</CardTitle><p className="mt-1 text-xs text-slate-500">{currentTest?.label ?? 'Chưa chọn bài kiểm tra'} · {currentTest?.date ?? ''}</p></div><Badge variant={saved ? 'success' : hasInvalid ? 'danger' : 'warning'}>{saved ? 'Đã lưu' : hasInvalid ? 'Điểm không hợp lệ' : 'Đang chỉnh sửa'}</Badge></CardHeader><CardContent className="p-0">{scoresQuery.isLoading ? <div className="space-y-3 p-5">{[1, 2, 3, 4].map((item) => <Skeleton className="h-14 w-full" key={item} />)}</div> : scoresQuery.isError ? <div className="p-5 text-sm text-red-600">Không thể tải bảng điểm.</div> : <Table><TableHeader><TableRow><TableHead>Học viên</TableHead><TableHead className="w-40">Điểm số (0 - 10)</TableHead><TableHead className="min-w-48">Nhận xét</TableHead></TableRow></TableHeader><TableBody>{filteredRows.map((row) => <TableRow key={row.studentId}><TableCell><div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-600">{row.fullName.split(' ').slice(-2).map((part) => part[0]).join('')}</div><div><p className="font-medium text-slate-700">{row.fullName}</p><p className="text-xs text-slate-400">{row.code}</p></div></div></TableCell><TableCell><Input type="number" min="0" max="10" step="0.1" value={row.value ?? ''} onChange={(event) => setScore(row.studentId, event.target.value)} placeholder="—" className={cn('h-9 w-28 text-center font-semibold', row.value !== null && (row.value < 0 || row.value > 10) && 'border-red-400 text-red-600 focus-visible:ring-red-400')} /></TableCell><TableCell><Input value={row.note ?? ''} onChange={(event) => setNote(row.studentId, event.target.value)} placeholder="Nhận xét cho học viên..." className="h-9 min-w-44 text-xs" /></TableCell></TableRow>)}</TableBody></Table>}<div className="flex flex-col gap-3 border-t bg-slate-50/60 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><p className="text-xs text-slate-500"><UserRound className="mr-1 inline size-3.5" />{filteredRows.length} học viên hiển thị · Điểm tối đa 10</p><Button onClick={save} disabled={saving || !testId || hasInvalid}><Save className="size-4" />{saving ? 'Đang lưu...' : 'Lưu bảng điểm'}</Button></div></CardContent></Card></div>;
}

function ScoreSummary({ label, value, icon, tone }: { label: string; value: string; icon: React.ReactNode; tone: 'emerald' | 'amber' | 'slate' }) { const colors = { emerald: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600', slate: 'bg-slate-100 text-slate-500' }; return <Card><CardContent className="flex items-center gap-3 p-4"><div className={cn('grid size-9 place-items-center rounded-lg', colors[tone])}>{icon}</div><div><p className="text-xs text-slate-500">{label}</p><p className="mt-0.5 text-xl font-semibold text-slate-800">{value}</p></div></CardContent></Card>; }
