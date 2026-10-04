import { ActivityList } from '@/components/common/activity-list';
import { PageHeader } from '@/components/common/page-header';
import { StatCard } from '@/components/common/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboardService, directorService } from '@/services';
import { serverApiClient } from '@/lib/server-api-client';
import type { DirectorOverview } from '@/types';
import { DirectorCharts } from './director-charts';

export async function DirectorDashboard() { const [overview, dashboard] = await Promise.all([directorService.getOverview(serverApiClient), dashboardService.getOverview(serverApiClient)]); return <><PageHeader eyebrow="Ban giám đốc" title="Tổng quan điều hành" description="Theo dõi các chỉ số quan trọng về hoạt động đào tạo của Riki." /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{overview.stats.map((stat) => <StatCard key={stat.label} stat={stat} />)}</div><DirectorCharts overview={overview} /><div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_.75fr]"><OccupancyPanel overview={overview} /><ActivityList activities={dashboard.activities} /></div></>; }

function OccupancyPanel({ overview }: { overview: DirectorOverview }) { return <Card><CardHeader><CardTitle>Tỷ lệ lấp đầy lớp</CardTitle></CardHeader><CardContent className="space-y-4">{overview.classOccupancy.map((item) => <div key={item.code}><div className="mb-1.5 flex items-center justify-between text-xs"><span className="font-medium text-slate-700">{item.code}</span><span className="text-slate-500">{item.students}/{item.capacity} học viên · <b className="text-emerald-600">{item.occupancy}%</b></span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${item.occupancy}%` }} /></div></div>)}</CardContent></Card>; }
