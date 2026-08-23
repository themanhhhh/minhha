import { ActivityList } from '@/components/common/activity-list';
import { PageHeader } from '@/components/common/page-header';
import { StatCard } from '@/components/common/stat-card';
import { OverviewChart } from '@/components/charts/overview-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboardService } from '@/services';
import type { UserRole } from '@/types';
import { roleLabels } from '@/config/navigation';

const descriptions: Record<UserRole, string> = { STUDENT: 'Theo dõi hành trình học tập và những việc cần hoàn thành.', TEACHER: 'Nắm bắt lớp học, lịch giảng và công việc cần xử lý.', ACADEMIC_STAFF: 'Tổng quan vận hành đào tạo tại Trung tâm Nhật ngữ Riki.', DIRECTOR: 'Các chỉ số quan trọng về hoạt động đào tạo của trung tâm.' };
export async function DashboardOverview({ role }: { role: UserRole }) { const stats = await dashboardService.getStats(role); const activities = await dashboardService.getActivities(); return <><PageHeader eyebrow={roleLabels[role]} title={`Chào mừng trở lại`} description={descriptions[role]} /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map((stat) => <StatCard key={stat.label} stat={stat} />)}</div><div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">{role === 'DIRECTOR' ? <OverviewChart /> : <Card><CardHeader><CardTitle>Lịch học sắp tới</CardTitle></CardHeader><CardContent className="space-y-3"><ScheduleRow date="Hôm nay · 18:30" title="Kaiwa N4 · RKN4-01" detail="Phòng A-204" /><ScheduleRow date="Ngày mai · 19:00" title="Ngữ pháp N4 · RKN4-01" detail="Phòng A-204" /><ScheduleRow date="Thứ 5 · 18:30" title="Kanji N4 · RKN4-01" detail="Phòng B-102" /></CardContent></Card>}<ActivityList activities={activities} /></div></>; }
function ScheduleRow({ date, title, detail }: { date: string; title: string; detail: string }) { return <div className="flex items-center gap-3 rounded-lg border p-3"><div className="grid size-10 place-items-center rounded-lg bg-emerald-50 text-xs font-bold text-emerald-600">{date.split('·')[0].trim().slice(0, 3)}</div><div><p className="text-sm font-medium">{title}</p><p className="text-xs text-muted-foreground">{date.split('·')[1]} · {detail}</p></div></div>; }
