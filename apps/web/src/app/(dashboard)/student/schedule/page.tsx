import { BookOpen, CalendarDays, CheckCircle2, Clock3, MapPin } from 'lucide-react';
import { StudentPageIntro } from '@/components/common/student-page-intro';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { lessonService } from '@/services';
import { serverApiClient } from '@/lib/server-api-client';
import type { Lesson } from '@/types';

export default async function StudentSchedulePage() {
  const lessons = await lessonService.getAll({ request: serverApiClient });
  const upcoming = lessons.filter((lesson) => lesson.status === 'UPCOMING');
  const completed = lessons.filter((lesson) => lesson.status === 'COMPLETED');
  const classCodes = [...new Set(lessons.map((lesson) => lesson.className).filter(Boolean))];

  return (
    <div className="mx-auto max-w-6xl">
      <StudentPageIntro eyebrow="Không gian học tập" title="Lịch học" description="Theo dõi các buổi học sắp tới và nội dung đã hoàn thành." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">Lịch sắp tới</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-800">Các buổi học của bạn</h2>
            </div>
            <span className="text-xs text-slate-400">{upcoming.length} buổi</span>
          </div>
          <div className="space-y-3">
            {upcoming.map((lesson) => <ScheduleCard key={lesson.id} lesson={lesson} />)}
          </div>
        </section>
        <Card className="h-fit border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><CalendarDays className="size-5" /></div>
              <div><p className="text-xs text-slate-400">Tổng quan</p><h2 className="text-lg font-semibold text-slate-800">Lịch học của tôi</h2></div>
            </div>
            <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm">
              <SummaryRow label="Sắp tới" value={`${upcoming.length} buổi`} tone="text-emerald-600" />
              <SummaryRow label="Đã hoàn thành" value={`${completed.length} buổi`} tone="text-slate-600" />
               <SummaryRow label="Lớp đang học" value={classCodes.join(', ') || 'Chưa xếp lớp'} tone="text-slate-600" />
            </div>
            <div className="mt-6 rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-700">Mẹo học tập</p><p className="mt-1.5 text-xs leading-5 text-slate-500">Hãy xem lại nội dung buổi trước 15 phút trước khi vào lớp để theo kịp tiến độ.</p></div>
          </CardContent>
        </Card>
      </div>
      {completed.length > 0 && <section className="mt-8"><div className="mb-4 flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-500" /><h2 className="text-sm font-semibold text-slate-800">Đã hoàn thành gần đây</h2></div><div className="grid gap-3 sm:grid-cols-2">{completed.map((lesson) => <ScheduleCard key={lesson.id} lesson={lesson} />)}</div></section>}
    </div>
  );
}

function ScheduleCard({ lesson }: { lesson: Lesson }) {
  const completed = lesson.status === 'COMPLETED';
  return <Card className="border-slate-200 shadow-sm transition-colors hover:border-emerald-200"><CardContent className="flex items-center gap-4 p-4 sm:p-5"><div className={completed ? 'grid size-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500' : 'grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600'}>{completed ? <CheckCircle2 className="size-5" /> : <BookOpen className="size-5" />}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-medium text-slate-800">{lesson.title}</p><Badge variant={completed ? 'secondary' : 'success'}>{completed ? 'Đã học' : 'Sắp tới'}</Badge></div><p className="mt-1 text-xs text-slate-500">{lesson.className} · {lesson.date}</p><div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400"><span className="flex items-center gap-1.5"><Clock3 className="size-3.5" />{lesson.startTime} - {lesson.endTime}</span><span className="flex items-center gap-1.5"><MapPin className="size-3.5" />{lesson.room ?? 'Chưa xếp phòng'}</span></div></div></CardContent></Card>;
}

function SummaryRow({ label, value, tone }: { label: string; value: string; tone: string }) {
  return <div className="flex items-center justify-between"><span className="text-slate-400">{label}</span><span className={`font-semibold ${tone}`}>{value}</span></div>;
}
