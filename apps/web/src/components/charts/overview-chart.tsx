'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
const data = [{ month: 'T1', students: 158 }, { month: 'T2', students: 172 }, { month: 'T3', students: 184 }, { month: 'T4', students: 201 }, { month: 'T5', students: 224 }, { month: 'T6', students: 248 }];
export function OverviewChart() { return <Card><CardHeader><CardTitle>Tăng trưởng học viên</CardTitle></CardHeader><CardContent><div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} /><Tooltip cursor={{ fill: '#ecfdf5' }} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }} /><Bar dataKey="students" name="Học viên" fill="#10b981" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div></CardContent></Card>; }
