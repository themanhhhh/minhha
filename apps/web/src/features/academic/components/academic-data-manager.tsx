'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

type Row = { id: string; [key: string]: unknown };
interface Lookup { id: number; code: string; name: string; weight?: number | null; }
interface Lookups { roles: Lookup[]; statuses: Lookup[]; levels: Lookup[]; attendance: Lookup[]; testTypes: Lookup[]; }
type Kind = 'students' | 'teachers' | 'courses' | 'classes' | 'lessons';
interface Field { key: string; label: string; type?: string; required?: boolean; maxLength?: number; options?: { value: string; label: string }[]; }
interface History { reservations: { id: string; studentName: string; classCode: string; endDate: string; isActive: boolean; status: string; reason: string }[]; transfers: { id: string; studentName: string; fromClass: string; toClass: string; transferredOn: string; reason: string }[]; }

async function allRows(kind: string): Promise<Row[]> {
  const result: Row[] = [];
  for (let page = 1; ; page++) {
    const response = await apiClient<{ data: Row[]; meta: { total: number } }>(`/${kind}?page=${page}&pageSize=100`);
    result.push(...response.data);
    if (!response.data.length || result.length >= response.meta.total) return result;
  }
}
const labels: Record<Kind, string> = { students: 'Học viên', teachers: 'Giáo viên', courses: 'Khóa học', classes: 'Lớp học', lessons: 'Buổi học' };
const messageOf = (error: unknown) => error instanceof Error ? error.message : 'Không thể lưu. Vui lòng thử lại.';
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

export function AcademicDataManager() {
  const [tab, setTab] = useState<'records' | 'operations' | 'weights'>('records');
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();
  const router = useRouter();
  const lookups = useQuery({ queryKey: ['academic-lookups'], queryFn: () => apiClient<Lookups>('/lookups') });
  const data = useQuery({ queryKey: ['academic-edit-options'], queryFn: async () => {
    const [students, teachers, courses, classes] = await Promise.all(['students','teachers','courses','classes'].map(allRows));
    return { students, teachers, courses, classes };
  } });
  async function saved(text: string) { setMessage(text); await queryClient.invalidateQueries(); router.refresh(); }
  if (lookups.isLoading || data.isLoading) return <p className="p-6 text-sm text-slate-500">Đang tải thông tin đào tạo…</p>;
  if (!lookups.data || !data.data) return <p role="alert" className="p-6 text-red-600">Không tải được dữ liệu. Vui lòng thử lại.</p>;
  return <div className="mx-auto max-w-6xl space-y-5">
    <div><p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Học vụ</p><h1 className="mt-2 text-2xl font-semibold">Cập nhật đào tạo</h1><p className="mt-2 text-sm text-slate-500">Quản lý hồ sơ, lịch học, bảo lưu, chuyển lớp và cách tính điểm.</p></div>
    <nav aria-label="Nội dung quản lý" className="flex flex-wrap gap-2">{([['records','Hồ sơ và lớp học'],['operations','Bảo lưu và chuyển lớp'],['weights','Danh mục và trọng số']] as const).map(([key,label]) => <Button key={key} variant={tab===key?'default':'outline'} onClick={()=>{setTab(key);setMessage('');}}>{label}</Button>)}</nav>
    {message && <p role="status" className="rounded-lg border bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
    {tab==='records' && <RecordEditor options={data.data} lookups={lookups.data} onSaved={saved} />}
    {tab==='operations' && <Operations options={data.data} onSaved={saved} />}
    {tab==='weights' && <Weights lookups={lookups.data} onSaved={saved} />}
  </div>;
}

type Options = { students: Row[]; teachers: Row[]; courses: Row[]; classes: Row[] };
const rowOptions = (rows: Row[], name: string) => rows.map(row=>({ value: String(row.id), label: `${String(row.code ?? '')} · ${String(row[name] ?? '')}` }));
function RecordEditor({ options, lookups, onSaved }: { options: Options; lookups: Lookups; onSaved: (message: string)=>Promise<void> }) {
  const [kind,setKind] = useState<Kind>('students');
  const [id,setId] = useState('');
  const [values,setValues] = useState<Record<string,string>>({});
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const rows = useQuery({ queryKey: ['editable-records',kind], queryFn: ()=>allRows(kind) });
  const record = useQuery({ queryKey: ['editable-record',kind,id], queryFn: ()=>apiClient<Row>(`/${kind}/${id}`), enabled: Boolean(id) });
  useEffect(()=>{
    if (!id) { setValues({ dateOfBirth:'', totalLessons:'24', tuition:'0', capacity:'20', startDate:today(), lessonDate:today(), startTime:'19:00', endTime:'20:30' }); return; }
    if (record.data) setValues(Object.fromEntries(Object.entries(record.data).map(([key,value])=>[key,value===null?'':String(value)])));
  },[id,kind,record.data]);
  const levels = lookups.levels.map(l=>({value:l.code,label:l.name}));
  const base: Record<Kind,Field[]> = {
    students: [{key:'studentCode',label:'Mã học viên',required:true},{key:'fullName',label:'Họ và tên',required:true,maxLength:100},{key:'email',label:'Email',type:'email',required:true,maxLength:255},{key:'dateOfBirth',label:'Ngày sinh',type:'date',required:true},{key:'phone',label:'Điện thoại',maxLength:12},{key:'gender',label:'Giới tính',options:['Nam','Nữ','Khác'].map(value=>({value,label:value}))},{key:'currentLevel',label:'Trình độ hiện tại',options:levels},{key:'targetLevel',label:'Mục tiêu JLPT',options:levels},{key:'goal',label:'Mục tiêu học tập',maxLength:255},{key:'emergencyContact',label:'Liên hệ khẩn cấp',maxLength:255}],
    teachers: [{key:'teacherCode',label:'Mã giáo viên',required:true},{key:'fullName',label:'Họ và tên',required:true,maxLength:100},{key:'email',label:'Email',type:'email',required:true,maxLength:255},{key:'phone',label:'Điện thoại',maxLength:12},{key:'jlptLevel',label:'Trình độ JLPT',options:levels}],
    courses: [{key:'code',label:'Mã khóa học',required:true},{key:'name',label:'Tên khóa học',required:true,maxLength:100},{key:'level',label:'Trình độ JLPT',options:levels,required:true},{key:'totalLessons',label:'Tổng số buổi',type:'number',required:true},{key:'tuition',label:'Học phí',type:'number',required:true},{key:'description',label:'Mô tả khóa học',maxLength:255}],
    classes: [{key:'code',label:'Mã lớp',required:true},{key:'name',label:'Tên lớp',required:true,maxLength:100},{key:'courseId',label:'Khóa học',options:rowOptions(options.courses,'name'),required:true},{key:'teacherId',label:'Giáo viên phụ trách',options:rowOptions(options.teachers,'fullName'),required:true},{key:'startDate',label:'Ngày khai giảng',type:'date',required:true},{key:'endDate',label:'Ngày kết thúc',type:'date'},{key:'schedule',label:'Lịch học',required:true,maxLength:100},{key:'session',label:'Ca học',maxLength:50},{key:'capacity',label:'Sĩ số tối đa',type:'number',required:true},{key:'room',label:'Phòng học'},{key:'meetingUrl',label:'Link vào học trực tuyến',type:'url',maxLength:255}],
    lessons: [{key:'classId',label:'Lớp học',options:rowOptions(options.classes,'name'),required:true},{key:'title',label:'Tên buổi học',required:true,maxLength:100},{key:'lessonDate',label:'Ngày học',type:'date',required:true},{key:'startTime',label:'Giờ bắt đầu',type:'time',required:true},{key:'endTime',label:'Giờ kết thúc',type:'time',required:true},{key:'content',label:'Nội dung buổi học',maxLength:255},{key:'recordUrl',label:'Link bản ghi buổi học',type:'url',maxLength:255},{key:'substituteTeacherId',label:'Giáo viên dạy thay',options:rowOptions(options.teachers,'fullName')},{key:'status',label:'Trạng thái',options:[{value:'UPCOMING',label:'Sắp diễn ra'},{value:'IN_PROGRESS',label:'Đang học'},{value:'COMPLETED',label:'Hoàn thành'},{value:'POSTPONED',label:'Hoãn'},{value:'CANCELLED',label:'Hủy'}]}],
  };
  useEffect(()=>{ if (!record.data || !id) return; setValues(current=>({...current, studentCode:String(record.data.code??''), teacherCode:String(record.data.code??''), ...Object.fromEntries(['dateOfBirth','startDate','endDate','lessonDate'].map(key=>[key,String(record.data[key]??'').slice(0,10)])) })); },[record.data,id]);
  const fields: Field[] = [...base[kind], ...(id && (kind==='courses'||kind==='classes') ? [{ key:'status', label:'Trạng thái', options: kind==='courses' ? [{value:'ACTIVE',label:'Hoạt động'},{value:'INACTIVE',label:'Ngừng hoạt động'}] : [{value:'UPCOMING',label:'Sắp khai giảng'},{value:'ACTIVE',label:'Đang học'},{value:'COMPLETED',label:'Hoàn thành'},{value:'CANCELLED',label:'Hủy'}] }] : [])];
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const body: Record<string,unknown> = {};
      for (const field of fields) {
        const value = values[field.key] ?? '';
        if (!value && !field.required && (field.options || field.type==='date' || field.type==='url' || field.key==='phone')) continue;
        body[field.key]=field.type==='number'?Number(value):value;
      }
      if (!id && (kind==='students'||kind==='teachers') && values.password) body.password=values.password;
      const result = await apiClient<{ temporaryPassword?: string }>(`/${kind}${id?`/${id}`:''}`,{method:id?'PATCH':'POST',body:JSON.stringify(body)});
      await onSaved(result.temporaryPassword ? `Đã lưu. Mật khẩu tạm thời: ${result.temporaryPassword}` : 'Đã lưu thông tin.');
    } catch (e) { setError(messageOf(e)); } finally {setBusy(false);}
  }
  return <Card><CardHeader><CardTitle>Hồ sơ và thông tin đào tạo</CardTitle></CardHeader><CardContent>
    <div className="mb-6 grid gap-4 sm:grid-cols-2"><FieldLabel label="Loại thông tin"><Select value={kind} onChange={e=>{setKind(e.target.value as Kind);setId('');setError('');}}>{Object.entries(labels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</Select></FieldLabel><FieldLabel label="Bản ghi"><Select value={id} onChange={e=>setId(e.target.value)}><option value="">Thêm mới</option>{(rows.data??[]).map(row=><option key={String(row.id)} value={String(row.id)}>{String(row.code??'')} · {String(row.fullName??row.name??row.title??row.id)}</option>)}</Select></FieldLabel></div>
    {id && record.isFetching ? <p>Đang tải…</p> : record.isError && id ? <p role="alert">Không tải được bản ghi.</p> : <form onSubmit={save} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2">{fields.map(field=><FieldLabel key={field.key} label={`${field.label}${field.required?' *':''}`}>{field.options ? <Select required={field.required} value={values[field.key]??''} onChange={e=>setValues(v=>({...v,[field.key]:e.target.value}))}><option value="">Chọn…</option>{field.options.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</Select> : <Input type={field.type??'text'} maxLength={field.maxLength} required={field.required} value={values[field.key]??''} onChange={e=>setValues(v=>({...v,[field.key]:e.target.value}))} min={field.type==='number'?0:undefined} step={field.key==='tuition'?'0.01':undefined} />}</FieldLabel>)}{!id&&(kind==='students'||kind==='teachers')&&<FieldLabel label="Mật khẩu ban đầu (để trống để tạo tự động)"><Input type="password" minLength={8} autoComplete="new-password" value={values.password??''} onChange={e=>setValues(v=>({...v,password:e.target.value}))}/></FieldLabel>}</div>{error&&<p role="alert" className="text-sm text-red-600">{error}</p>}<Button disabled={busy} type="submit">{busy?'Đang lưu…':'Lưu thông tin'}</Button></form>}
  </CardContent></Card>;
}

function Operations({ options, onSaved }: { options: Options; onSaved:(message:string)=>Promise<void> }) {
  const [mode,setMode]=useState<'reserve'|'transfer'|'enroll'>('reserve');
  const [studentId,setStudentId]=useState('');
  const [classId,setClassId]=useState('');
  const [targetId,setTargetId]=useState('');
  const [reason,setReason]=useState('');
  const [months,setMonths]=useState(1);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const history=useQuery({queryKey:['academic-operations',studentId],queryFn:()=>apiClient<History>(`/academic/operations${studentId?`?studentId=${studentId}`:''}`)});
  async function action(endpoint:string,body?:unknown) {
    setBusy(true);setError('');
    try {await apiClient(endpoint,{method:'POST',...(body?{body:JSON.stringify(body)}:{})});await onSaved('Đã cập nhật hồ sơ và sĩ số lớp.');}
    catch(e){setError(messageOf(e));}finally{setBusy(false);}
  }
  async function submit(e:FormEvent) {e.preventDefault();if(mode==='reserve')await action('/academic/reservations',{studentId,classId,reason,startDate:today(),durationMonths:months});else if(mode==='transfer')await action('/academic/transfers',{studentId,fromClassId:classId,toClassId:targetId,reason});else await action(`/classes/${classId}/students`,{studentId});}
  return <div className="space-y-5"><Card><CardHeader><CardTitle>Ghi danh, bảo lưu và chuyển lớp</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><FieldLabel label="Thao tác"><Select value={mode} onChange={e=>setMode(e.target.value as typeof mode)}><option value="reserve">Bảo lưu từ hôm nay</option><option value="transfer">Chuyển lớp cùng trình độ</option><option value="enroll">Ghi danh vào lớp</option></Select></FieldLabel><FieldLabel label="Học viên"><Select required value={studentId} onChange={e=>setStudentId(e.target.value)}><option value="">Chọn học viên</option>{rowOptions(options.students,'fullName').map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</Select></FieldLabel><FieldLabel label={mode==='transfer'?'Lớp hiện tại':'Lớp học'}><Select required value={classId} onChange={e=>setClassId(e.target.value)}><option value="">Chọn lớp</option>{rowOptions(options.classes,'name').map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</Select></FieldLabel>{mode==='transfer'&&<FieldLabel label="Lớp chuyển đến"><Select required value={targetId} onChange={e=>setTargetId(e.target.value)}><option value="">Chọn lớp</option>{rowOptions(options.classes,'name').filter(o=>o.value!==classId).map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</Select></FieldLabel>}{mode==='reserve'&&<FieldLabel label="Thời hạn bảo lưu (tháng)"><Input type="number" min={1} max={24} required value={months} onChange={e=>setMonths(Number(e.target.value))}/></FieldLabel>}{mode!=='enroll'&&<FieldLabel label="Lý do"><Input required maxLength={255} value={reason} onChange={e=>setReason(e.target.value)}/></FieldLabel>}</div><p className="text-xs text-slate-500">Bảo lưu giải phóng chỗ trong lớp. Khi quay lại, hệ thống kiểm tra sức chứa. Lịch sử điểm và điểm danh được giữ nguyên khi chuyển lớp.</p>{error&&<p role="alert" className="text-sm text-red-600">{error}</p>}<Button type="submit" disabled={busy}>{busy?'Đang xử lý…':'Thực hiện'}</Button></form></CardContent></Card><Card><CardHeader><CardTitle>Lịch sử bảo lưu</CardTitle></CardHeader><CardContent className="space-y-3">{history.isError&&<p role="alert">Không tải được lịch sử.</p>}{history.data?.reservations.map(r=><div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"><div><p className="text-sm font-medium">{r.studentName} · {r.classCode}</p><p className="text-xs text-slate-500">{r.reason} · Hết hạn {r.endDate?.slice(0,10)} · {r.isActive?'Đang bảo lưu':'Đã kết thúc'}</p></div>{r.isActive&&<div className="flex gap-2"><Button disabled={busy} variant="outline" onClick={()=>void action(`/academic/reservations/${r.id}/resume`)}>Quay lại học</Button><Button disabled={busy} variant="outline" onClick={()=>void action(`/academic/reservations/${r.id}/cancel`)}>Hủy bảo lưu</Button></div>}</div>)}{history.data?.reservations.length===0&&<p className="text-sm text-slate-500">Chưa có lịch sử bảo lưu.</p>}<Button disabled={busy} variant="outline" onClick={()=>void action('/academic/reservations/expire')}>Cập nhật bảo lưu đã hết hạn</Button></CardContent></Card><Card><CardHeader><CardTitle>Lịch sử chuyển lớp</CardTitle></CardHeader><CardContent>{history.data?.transfers.map(t=><div key={t.id} className="border-b py-3 text-sm"><p>{t.studentName} · {t.fromClass} → {t.toClass}</p><p className="mt-1 text-xs text-slate-500">{t.transferredOn?.slice(0,10)} · {t.reason}</p></div>)}{history.data?.transfers.length===0&&<p className="text-sm text-slate-500">Chưa có lịch sử chuyển lớp.</p>}</CardContent></Card></div>;
}

function Weights({ lookups,onSaved }: { lookups:Lookups;onSaved:(message:string)=>Promise<void> }) {
  const [entries,setEntries]=useState(lookups.testTypes.map(t=>({code:t.code,weight:t.weight??0})));
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const total=entries.reduce((sum,e)=>sum+e.weight,0);
  async function save(e:FormEvent){e.preventDefault();setBusy(true);setError('');try{await apiClient('/lookups/test-weights',{method:'PATCH',body:JSON.stringify({entries})});await onSaved('Đã lưu trọng số. Điểm tạm tính và báo cáo đã được cập nhật.');}catch(err){setError(messageOf(err));}finally{setBusy(false);}}
  return <div className="space-y-5"><Card><CardHeader><CardTitle>Trọng số điểm theo loại bài</CardTitle></CardHeader><CardContent><p className="mb-4 text-sm text-slate-500">Trọng số áp dụng cho toàn bộ lớp. Hệ thống tính trung bình từng loại bài rồi nhân trọng số. Thiếu bài bắt buộc sẽ hiển thị điểm tạm tính; JLPT có thể để 0% nếu chỉ dùng tham khảo.</p><form onSubmit={save} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2">{lookups.testTypes.map(t=><FieldLabel key={t.code} label={`${t.name} (%)`}><Input type="number" min={0} max={100} step="0.1" required value={entries.find(e=>e.code===t.code)?.weight??0} onChange={e=>setEntries(current=>current.map(row=>row.code===t.code?{...row,weight:Number(e.target.value)}:row))}/></FieldLabel>)}</div><p className="text-sm">Tổng trọng số: {total}%</p>{error&&<p role="alert" className="text-red-600">{error}</p>}<Button disabled={busy||Math.abs(total-100)>0.000001} type="submit">{busy?'Đang lưu…':'Lưu trọng số'}</Button></form></CardContent></Card><div className="grid gap-4 sm:grid-cols-2">{([['Vai trò',lookups.roles],['Trạng thái tài khoản',lookups.statuses],['Trình độ JLPT',lookups.levels],['Điểm danh',lookups.attendance]] as const).map(([title,rows])=><Card key={title}><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">{rows.map(r=><span className="rounded-full bg-slate-100 px-3 py-1 text-sm" key={r.id}>{r.name}</span>)}</CardContent></Card>)}</div></div>;
}

function FieldLabel({label,children}:{label:string;children:ReactNode}) {return <label className="block space-y-2 text-sm"><span className="font-medium text-slate-600">{label}</span>{children}</label>;}
