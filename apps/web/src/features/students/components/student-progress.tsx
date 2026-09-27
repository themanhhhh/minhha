'use client';

import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Check, Clock3, TrendingUp, XCircle } from 'lucide-react';
import { useStudentProgress } from '@/features/students/hooks/use-student-progress';
import { StudentPageIntro } from '@/components/common/student-page-intro';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/error-state';
import { cn } from '@/lib/utils';
import type { AttendanceSummary, ScoreSummary } from '@/types';

type ProgressTab = 'attendance' | 'scores';
const attendanceColors = ['#10b981', '#ef4444', '#f59e0b'];

export function StudentProgress() {
  const [tab, setTab] = useState<ProgressTab>('attendance');
  const { attendance, scores } = useStudentProgress();
  const loading = attendance.isLoading || scores.isLoading;
  const error = attendance.isError || scores.isError;

  if (loading) return <ProgressLoading />;
  if (error || !attendance.data || !scores.data) return <ErrorState onRetry={() => { void attendance.refetch(); void scores.refetch(); }} />;

  return (
    <div className="mx-auto max-w-6xl">
      <StudentPageIntro eyebrow="Theo dõi tiến độ" title="Quá trình học tập" description="Theo dõi chuyên cần, điểm số và sự tiến bộ của bạn theo từng giai đoạn." />
      <div className="mb-5 inline-flex rounded-lg bg-slate-100 p-1">
        <TabButton active={tab === 'attendance'} onClick={() => setTab('attendance')}>Chuyên cần</TabButton>
        <TabButton active={tab === 'scores'} onClick={() => setTab('scores')}>Điểm số</TabButton>
      </div>
      {tab === 'attendance' ? <AttendanceView summary={attendance.data} /> : <ScoresView summary={scores.data} />}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={cn('rounded-md px-3 py-1.5 text-[11px] font-medium transition-all', active ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>{children}</button>;
}

function AttendanceView({ summary }: { summary: AttendanceSummary }) {
  const data = [{ name: 'Có mặt', value: summary.present }, { name: 'Vắng mặt', value: summary.absent }, { name: 'Đi muộn', value: summary.late }];
  return <div className="grid gap-4 lg:grid-cols-[1.05fr_.95fr]"><Card><CardHeader className="pb-2"><CardTitle className="text-sm">Thống kê chuyên cần</CardTitle></CardHeader><CardContent><div className="h-56 w-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={82} paddingAngle={3} stroke="none">{data.map((entry, index) => <Cell key={entry.name} fill={attendanceColors[index]} />)}</Pie><Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} /></PieChart></ResponsiveContainer></div><div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] text-slate-500"><LegendItem color="bg-emerald-500" label={`Có mặt: ${summary.present}`} /><LegendItem color="bg-red-500" label={`Vắng mặt: ${summary.absent}`} /><LegendItem color="bg-amber-500" label={`Đi muộn: ${summary.late}`} /></div></CardContent></Card><ParticipationCard summary={summary} /></div>;
}

function ParticipationCard({ summary }: { summary: AttendanceSummary }) {
  return <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Tỷ lệ tham gia</CardTitle></CardHeader><CardContent><div className="flex flex-col items-center pt-3"><p className="text-4xl font-bold tracking-tight text-emerald-500">{summary.participationRate}%</p><p className="mt-1 text-xs text-slate-400">Tỷ lệ tham gia</p><div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${summary.participationRate}%` }} /></div><div className="mt-4 grid w-full grid-cols-3 gap-2"><AttendanceStat icon={<Check />} value={summary.present} label="Có mặt" tone="emerald" /><AttendanceStat icon={<XCircle />} value={summary.absent} label="Vắng" tone="red" /><AttendanceStat icon={<Clock3 />} value={summary.late} label="Đi muộn" tone="amber" /></div></div></CardContent></Card>;
}

function AttendanceStat({ icon, value, label, tone }: { icon: React.ReactNode; value: number; label: string; tone: 'emerald' | 'red' | 'amber' }) {
  const colors = { emerald: 'text-emerald-500', red: 'text-red-500', amber: 'text-amber-500' };
  return <div className="rounded-lg bg-slate-50 px-2 py-2 text-center"><div className={cn('mx-auto flex items-center justify-center gap-1 text-xs font-semibold', colors[tone])}>{icon}<span>{value}</span></div><p className="mt-1 text-[10px] text-slate-400">{label}</p></div>;
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return <span className="flex items-center gap-1.5"><span className={cn('size-2 rounded-sm', color)} />{label}</span>;
}

function ScoresView({ summary }: { summary: ScoreSummary }) {
  return <div className="space-y-4"><div className="grid gap-4 sm:grid-cols-3"><ScoreStat label="Điểm trung bình" value={summary.average.toFixed(1)} detail="Trên tất cả bài kiểm tra" icon={<TrendingUp />} /><ScoreStat label="Điểm cao nhất" value={summary.highest.toFixed(1)} detail="Bài giữa khóa N4" icon={<Check />} /><ScoreStat label="Bài đã hoàn thành" value={String(summary.completedTests)} detail="Bài kiểm tra" icon={<Clock3 />} /></div><div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]"><Card><CardHeader><CardTitle className="text-sm">Kết quả theo kỹ năng</CardTitle></CardHeader><CardContent><div className="h-60 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={summary.subjects} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} /><YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} /><Tooltip cursor={{ fill: '#ecfdf5' }} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} /><Bar dataKey="score" name="Điểm" fill="#10b981" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div></CardContent></Card><Card><CardHeader><CardTitle className="text-sm">Điểm số gần đây</CardTitle></CardHeader><CardContent className="space-y-4">{summary.recent.map((item) => <div key={item.title} className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-700">{item.title}</p><p className="mt-1 text-xs text-slate-400">{item.className} · {item.date}</p></div><span className="shrink-0 text-lg font-bold text-emerald-500">{item.score.toFixed(1)}</span></div>)}</CardContent></Card></div></div>;
}

function ScoreStat({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: React.ReactNode }) {
  return <Card><CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-xs text-slate-400">{label}</p><p className="mt-2 text-2xl font-bold text-slate-800">{value}</p><p className="mt-1 text-[11px] text-slate-400">{detail}</p></div><div className="grid size-9 place-items-center rounded-lg bg-emerald-50 text-emerald-500">{icon}</div></div></CardContent></Card>;
}

function ProgressLoading() {
  return <div className="mx-auto max-w-6xl space-y-5"><Skeleton className="h-24 rounded-xl" /><Skeleton className="h-9 w-36" /><div className="grid gap-4 lg:grid-cols-2"><Skeleton className="h-80" /><Skeleton className="h-80" /></div></div>;
}
