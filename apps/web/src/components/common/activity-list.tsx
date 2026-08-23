import { CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardActivity } from '@/types';
const icons = { success: CheckCircle2, info: Info, warning: TriangleAlert };
export function ActivityList({ activities }: { activities: DashboardActivity[] }) { return <Card><CardHeader><CardTitle>Hoạt động gần đây</CardTitle></CardHeader><CardContent className="space-y-5">{activities.map((activity) => { const Icon = icons[activity.type]; return <div className="flex gap-3" key={activity.title}><Avatar initials={<Icon className="size-4" /> as unknown as string} className="bg-slate-100 text-slate-600" /><div className="min-w-0 flex-1"><p className="text-sm font-medium">{activity.title}</p><p className="mt-0.5 text-xs text-muted-foreground">{activity.description}</p></div><time className="shrink-0 text-xs text-muted-foreground">{activity.time}</time></div>; })}</CardContent></Card>; }
