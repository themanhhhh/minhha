'use client';

import { useState } from 'react';
import { ArrowLeft, Edit3 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DetailStat { label: string; value: string; }
interface DetailField { label: string; value: string; }
export function ResourceDetail({ backHref, eyebrow, title, code, description, stats, fields, tabs }: { backHref: string; eyebrow: string; title: string; code: string; description: string; stats: DetailStat[]; fields: DetailField[]; tabs: string[] }) {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  return <div className="mx-auto max-w-6xl"><Link href={backHref} className="mb-5 inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-emerald-600"><ArrowLeft className="size-3.5" />Quay lại danh sách</Link><div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-500">{eyebrow} · {code}</p><h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{title}</h1><p className="mt-2 text-sm text-slate-500">{description}</p></div><Button variant="outline"><Edit3 className="size-4" />Chỉnh sửa</Button></div><div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{stats.map((stat) => <Card key={stat.label}><CardContent className="p-4"><p className="text-xs text-slate-400">{stat.label}</p><p className="mt-1 text-xl font-semibold text-slate-800">{stat.value}</p></CardContent></Card>)}</div><Card><CardHeader className="border-b px-4 pb-0 sm:px-6"><div className="flex gap-5 overflow-x-auto">{tabs.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={cn('shrink-0 border-b-2 pb-3 text-sm font-medium transition-colors', activeTab === tab ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800')}>{tab}</button>)}</div></CardHeader><CardContent className="p-5 sm:p-6">{activeTab === tabs[0] ? <div className="grid gap-3 sm:grid-cols-2">{fields.map((field) => <div className="rounded-lg bg-slate-50 px-4 py-3" key={field.label}><p className="text-xs text-slate-400">{field.label}</p><p className="mt-1 text-sm font-medium text-slate-700">{field.value}</p></div>)}</div> : <div className="flex min-h-40 flex-col items-center justify-center text-center"><Badge variant="secondary">{activeTab}</Badge><p className="mt-3 text-sm text-slate-500">Nội dung {activeTab.toLowerCase()} sẽ được hiển thị tại đây.</p></div>}</CardContent></Card></div>;
}
