import { ActivityList } from '@/components/common/activity-list';
import { PageHeader } from '@/components/common/page-header';
import { StudentPageIntro } from '@/components/common/student-page-intro';
import { StatCard } from '@/components/common/stat-card';
import { OverviewChart } from '@/components/charts/overview-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboardService } from '@/services';
import { serverApiClient } from '@/lib/server-api-client';
import type { UserRole } from '@/types';
import { roleLabels } from '@/config/navigation';

const descriptions: Record<UserRole, string> = { STUDENT: 'Theo dõi hành trình học tập và những việc cần hoàn thành.', TEACHER: 'Nắm bắt lớp học, lịch giảng và công việc cần xử lý.', ACADEMIC_STAFF: 'Tổng quan vận hành đào tạo tại Trung tâm Nhật ngữ Riki.', DIRECTOR: 'Các chỉ số quan trọng về hoạt động đào tạo của trung tâm.' };
export async function DashboardOverview({ role }: { role: UserRole }) {
  const overview = await dashboardService.getOverview(serverApiClient);
  const pageIntro = role === 'STUDENT'
    ? <StudentPageIntro eyebrow="Tổng quan học tập" title="Chào mừng trở lại" description={descriptions[role]} />
    : <PageHeader eyebrow={roleLabels[role]} title="Chào mừng trở lại" description={descriptions[role]} />;

  return (
    <>
      {pageIntro}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{overview.stats.map((stat) => <StatCard key={stat.label} stat={stat} />)}</div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        {role === 'DIRECTOR' ? <OverviewChart data={overview.monthlyStudents ?? []} /> : <Card><CardHeader><CardTitle>Lịch học sắp tới</CardTitle></CardHeader><CardContent className="space-y-3">{overview.schedule.length ? overview.schedule.map((lesson) => <ScheduleRow key={lesson.id} date={`${lesson.date.slice(0, 10)} · ${lesson.startTime}`} title={`${lesson.title} · ${lesson.classCode}`} detail={lesson.detail} />) : <p className="text-sm text-muted-foreground">Chưa có lịch học sắp tới.</p>}</CardContent></Card>}
        <ActivityList activities={overview.activities} />
      </div>
    </>
  );
}
function ScheduleRow({ date, title, detail }: { date: string; title: string; detail: string }) { return <div className="flex items-center gap-3 rounded-lg border p-3"><div className="grid size-10 place-items-center rounded-lg bg-emerald-50 text-xs font-bold text-emerald-600">{date.slice(0, 3)}</div><div><p className="text-sm font-medium">{title}</p><p className="text-xs text-muted-foreground">{date.slice(11)} · {detail}</p></div></div>; }
