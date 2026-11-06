'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

interface Lesson { id:string; title:string; classCode:string; lessonDate:string; startTime:string; endTime:string; startsAt:string; substituteTeacherId?:string; recordUrl?:string|null; }
interface Entry { studentId:string; code:string; fullName:string; status:'PRESENT'|'ABSENT'|'LATE'|null; note?:string|null; }
export default function SubstituteLessonsPage() {
  const [id,setId]=useState(''); const [rows,setRows]=useState<Entry[]>([]); const [record,setRecord]=useState(''); const [message,setMessage]=useState(''); const [busy,setBusy]=useState(false);
  const schedule=useQuery({queryKey:['substitute-lessons'],queryFn:async()=>{
    const teacher=await apiClient<{id:string}>('/me/teacher-profile');const all:Lesson[]=[];
    for(let page=1;;page++){const response=await apiClient<{data:Lesson[];meta:{total:number}}>(`/lessons?pageSize=100&page=${page}`);all.push(...response.data);if(!response.data.length||all.length>=response.meta.total)break;}
    return all.filter(lesson=>String(lesson.substituteTeacherId)===String(teacher.id));
  }});
  const attendance=useQuery({queryKey:['substitute-attendance',id],queryFn:()=>apiClient<{data:Entry[]}>(`/lessons/${id}/attendance`),enabled:Boolean(id)});
  const current=schedule.data?.find(l=>String(l.id)===id);
  useEffect(()=>{if(attendance.data)setRows(attendance.data.data);},[attendance.data]);
  useEffect(()=>{setRecord(current?.recordUrl??'');setMessage('');},[current]);
  async function save(kind:'attendance'|'record') {
    setBusy(true);setMessage('');
    try {await apiClient(`/lessons/${id}/${kind}`,{method:kind==='attendance'?'PUT':'PATCH',body:JSON.stringify(kind==='attendance'?{entries:rows.filter(row=>row.status!==null).map(({studentId,status,note})=>({studentId,status,note}))}:{recordUrl:record||null})});setMessage('Đã lưu cập nhật buổi dạy thay.');await attendance.refetch();await schedule.refetch();}
    catch(error){setMessage(error instanceof Error?error.message:'Không thể lưu. Vui lòng thử lại.');}finally{setBusy(false);}
  }
  const editable=Boolean(current&&new Date(current.startsAt)<=new Date());
  return <div className="mx-auto max-w-5xl space-y-5"><div><h1 className="text-2xl font-semibold">Buổi dạy thay</h1><p className="mt-2 text-sm text-slate-500">Điểm danh và cập nhật bản ghi cho từng buổi được phân công. Quyền nhập điểm của cả lớp vẫn thuộc giáo viên phụ trách.</p></div><Card><CardContent className="space-y-3 p-5"><label className="block text-sm">Buổi học<Select className="mt-2" value={id} onChange={e=>setId(e.target.value)}><option value="">Chọn buổi học</option>{schedule.data?.map(lesson=><option key={lesson.id} value={lesson.id}>{lesson.classCode} · {lesson.title} · {lesson.lessonDate.slice(0,10)} {lesson.startTime}–{lesson.endTime}</option>)}</Select></label>{schedule.isLoading&&<p>Đang tải…</p>}{schedule.isError&&<p role="alert">Không tải được lịch dạy thay.</p>}{schedule.data?.length===0&&<p className="text-sm text-slate-500">Bạn chưa được phân công buổi dạy thay.</p>}</CardContent></Card>{id&&<><Card><CardHeader><CardTitle>Điểm danh</CardTitle></CardHeader><CardContent className="space-y-3">{attendance.isError&&<p role="alert">Không tải được danh sách học viên.</p>}{rows.map(row=><div key={row.studentId} className="grid items-center gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_160px_1fr]"><p className="text-sm">{row.fullName}<span className="block text-xs text-slate-500">{row.code}</span></p><Select aria-label={`Điểm danh ${row.code}`} value={row.status??''} onChange={e=>setRows(previous=>previous.map(item=>item.studentId===row.studentId?{...item,status:e.target.value as Entry['status']}:item))}><option value="" disabled>Chưa điểm danh</option><option value="PRESENT">Có mặt</option><option value="ABSENT">Vắng mặt</option><option value="LATE">Đi muộn</option></Select><Input aria-label={`Ghi chú ${row.code}`} placeholder="Ghi chú" maxLength={255} value={row.note??''} onChange={e=>setRows(previous=>previous.map(item=>item.studentId===row.studentId?{...item,note:e.target.value}:item))}/></div>)}<Button disabled={busy||!editable||attendance.isLoading} onClick={()=>void save('attendance')}>Lưu điểm danh</Button></CardContent></Card><Card><CardHeader><CardTitle>Bản ghi buổi học</CardTitle></CardHeader><CardContent className="space-y-3"><Input type="url" aria-label="Liên kết bản ghi" placeholder="https://…" value={record} maxLength={255} onChange={e=>setRecord(e.target.value)}/><Button disabled={busy||!editable} onClick={()=>void save('record')}>Lưu liên kết bản ghi</Button>{!editable&&<p className="text-xs text-slate-500">Có thể cập nhật sau khi buổi học bắt đầu.</p>}</CardContent></Card></>}{message&&<p role="status" className="rounded-lg border p-3 text-sm">{message}</p>}</div>;
}
