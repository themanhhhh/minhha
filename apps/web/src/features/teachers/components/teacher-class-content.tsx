'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, CalendarClock, FileText, LoaderCircle, Paperclip, Plus, Trash2, Upload, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { teacherAssessmentService, teacherClassService } from '@/services';
import type { TeacherClassContent, TeacherLessonOption } from '@/types';
import { cn } from '@/lib/utils';

const assignmentAccept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt,image/jpeg,image/png,image/webp,image/gif,audio/mpeg,video/mp4';
const materialAccept = assignmentAccept;

export function TeacherClassContent({ classId }: { classId: number }) {
  const [content, setContent] = useState<TeacherClassContent>({ assignments: [], materials: [] });
  const [form, setForm] = useState<'ASSIGNMENT' | 'MATERIAL' | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const contentQuery = useQuery({ queryKey: ['teacher-class-content', classId], queryFn: () => teacherClassService.getContent(classId) });
  const lessonsQuery = useQuery({ queryKey: ['teacher-class-content-lessons', classId], queryFn: () => teacherAssessmentService.getLessons(classId) });

  useEffect(() => {
    if (contentQuery.data) setContent(contentQuery.data);
  }, [contentQuery.data]);

  function showForm(next: 'ASSIGNMENT' | 'MATERIAL') {
    setMessage(null);
    setForm((current) => current === next ? null : next);
  }

  async function removeAssignment(assignmentId: number | string) {
    if (!window.confirm('Xóa bài tập này? Học viên sẽ không còn thấy bài tập trong lớp.')) return;
    try {
      await teacherClassService.deleteAssignment(classId, assignmentId);
      setContent((current) => ({ ...current, assignments: current.assignments.filter((item) => String(item.id) !== String(assignmentId)) }));
      setMessage({ type: 'success', text: 'Đã xóa bài tập.' });
    } catch (error) {
      setMessage({ type: 'error', text: errorMessage(error) });
    }
  }

  async function removeMaterial(materialId: number | string) {
    if (!window.confirm('Xóa tài liệu này khỏi lớp học?')) return;
    try {
      await teacherClassService.deleteMaterial(classId, materialId);
      setContent((current) => ({ ...current, materials: current.materials.filter((item) => String(item.id) !== String(materialId)) }));
      setMessage({ type: 'success', text: 'Đã xóa tài liệu.' });
    } catch (error) {
      setMessage({ type: 'error', text: errorMessage(error) });
    }
  }

  return <section className="mx-auto max-w-7xl space-y-5"><div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between"><div><div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-500"><BookOpen className="size-3.5" />Học liệu lớp học</div><h2 className="text-2xl font-semibold tracking-tight text-slate-900">Bài tập & tài liệu</h2><p className="mt-2 text-sm text-slate-500">Đăng bài tập, tài liệu bài giảng và gắn nội dung với từng buổi học.</p></div><div className="flex flex-wrap gap-2"><Button type="button" variant={form === 'ASSIGNMENT' ? 'secondary' : 'outline'} onClick={() => showForm('ASSIGNMENT')}><Plus className="size-4" />Tạo bài tập</Button><Button type="button" variant={form === 'MATERIAL' ? 'secondary' : 'outline'} onClick={() => showForm('MATERIAL')}><Upload className="size-4" />Thêm tài liệu</Button></div></div>{message && <div className={cn('rounded-lg border px-4 py-3 text-sm', message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700')}>{message.text}</div>}{form === 'ASSIGNMENT' && <AssignmentForm classId={classId} onCreated={(assignment) => { setContent((current) => ({ ...current, assignments: [...current.assignments, assignment].sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()) })); setForm(null); setMessage({ type: 'success', text: 'Đã đăng bài tập cho lớp.' }); }} onError={(error) => setMessage({ type: 'error', text: error })} onCancel={() => setForm(null)} />}{form === 'MATERIAL' && <MaterialForm classId={classId} lessons={lessonsQuery.data ?? []} onCreated={(material) => { setContent((current) => ({ ...current, materials: [material, ...current.materials] })); setForm(null); setMessage({ type: 'success', text: 'Đã đăng tài liệu bài giảng.' }); }} onError={(error) => setMessage({ type: 'error', text: error })} onCancel={() => setForm(null)} />}{contentQuery.isLoading ? <LoadingCard /> : contentQuery.isError ? <Card><CardContent className="p-8 text-center text-sm text-red-600">Không tải được học liệu của lớp.</CardContent></Card> : <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]"><ContentList title="Bài tập" description="Bài tập học viên cần hoàn thành" empty="Chưa có bài tập nào được đăng." count={content.assignments.length}>{content.assignments.map((assignment) => <AssignmentRow key={assignment.id} assignment={assignment} onDelete={() => void removeAssignment(assignment.id)} />)}</ContentList><ContentList title="Tài liệu bài giảng" description="Tài liệu được chia sẻ với cả lớp" empty="Chưa có tài liệu bài giảng." count={content.materials.length}>{content.materials.map((material) => <MaterialRow key={material.id} material={material} onDelete={() => void removeMaterial(material.id)} />)}</ContentList></div>}</section>;
}

function AssignmentForm({ classId, onCreated, onError, onCancel }: { classId: number; onCreated: (assignment: Awaited<ReturnType<typeof teacherClassService.createAssignment>>) => void; onError: (message: string) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueAt, setDueAt] = useState(defaultDueAt());
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return onError('Vui lòng nhập tên bài tập.');
    const fileError = validateFiles(files, 5, 10);
    if (fileError) return onError(fileError);
    setSaving(true);
    try {
      const assignment = await teacherClassService.createAssignment(classId, { title: title.trim(), description: description.trim(), dueAt: new Date(dueAt).toISOString(), files });
      onCreated(assignment);
    } catch (error) {
      onError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return <Card className="border-emerald-200 bg-emerald-50/30 shadow-sm"><CardHeader className="flex-row items-start justify-between border-b border-emerald-100"><div><CardTitle className="text-base">Tạo bài tập mới</CardTitle><p className="mt-1 text-xs text-slate-500">Học viên sẽ thấy bài tập ngay sau khi đăng.</p></div><Button type="button" variant="ghost" size="sm" onClick={onCancel} aria-label="Đóng"><X className="size-4" /></Button></CardHeader><CardContent><form className="grid gap-4 lg:grid-cols-2" onSubmit={(event) => void submit(event)}><div className="space-y-4"><Field label="Tên bài tập"><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ví dụ: Bài tập ngữ pháp bài 17" maxLength={200} /></Field><Field label="Hạn nộp"><Input type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} /></Field><Field label="Hướng dẫn"><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Mô tả yêu cầu, cách nộp bài..." rows={5} className="flex w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" /></Field></div><div className="flex flex-col rounded-xl border border-dashed border-emerald-200 bg-white p-4"><p className="text-sm font-medium text-slate-700">File đề bài <span className="font-normal text-slate-400">(không bắt buộc)</span></p><p className="mt-1 text-xs leading-5 text-slate-400">Tối đa 5 file, 10 MB/file. PDF, Word, Excel, PowerPoint, ZIP, ảnh, audio hoặc video.</p><label className="mt-4 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg bg-emerald-50/70 px-4 text-center transition-colors hover:bg-emerald-50"><Paperclip className="size-6 text-emerald-500" /><span className="mt-2 text-sm font-medium text-emerald-700">Chọn file đính kèm</span><span className="mt-1 text-xs text-slate-400">Có thể chọn nhiều file</span><input type="file" multiple accept={assignmentAccept} className="sr-only" onChange={(event) => setFiles(Array.from(event.target.files ?? []))} /></label>{files.length > 0 && <div className="mt-3 space-y-2">{files.map((file) => <FileChip key={`${file.name}-${file.size}`} file={file} />)}</div>}<div className="mt-auto flex justify-end gap-2 pt-5"><Button type="button" variant="ghost" onClick={onCancel}>Hủy</Button><Button type="submit" disabled={saving}>{saving && <LoaderCircle className="size-4 animate-spin" />}{saving ? 'Đang đăng...' : 'Đăng bài tập'}</Button></div></div></form></CardContent></Card>;
}

function MaterialForm({ classId, lessons, onCreated, onError, onCancel }: { classId: number; lessons: TeacherLessonOption[]; onCreated: (material: Awaited<ReturnType<typeof teacherClassService.createMaterial>>) => void; onError: (message: string) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lessonId, setLessonId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return onError('Vui lòng nhập tên tài liệu.');
    if (!file) return onError('Vui lòng chọn file tài liệu.');
    const fileError = validateFiles([file], 1, 25);
    if (fileError) return onError(fileError);
    setSaving(true);
    try {
      const material = await teacherClassService.createMaterial(classId, { title: title.trim(), description: description.trim(), lessonId, file });
      onCreated(material);
    } catch (error) {
      onError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return <Card className="border-emerald-200 bg-emerald-50/30 shadow-sm"><CardHeader className="flex-row items-start justify-between border-b border-emerald-100"><div><CardTitle className="text-base">Thêm tài liệu bài giảng</CardTitle><p className="mt-1 text-xs text-slate-500">File sẽ được chia sẻ với học viên trong lớp.</p></div><Button type="button" variant="ghost" size="sm" onClick={onCancel} aria-label="Đóng"><X className="size-4" /></Button></CardHeader><CardContent><form className="grid gap-4 lg:grid-cols-2" onSubmit={(event) => void submit(event)}><div className="space-y-4"><Field label="Tên tài liệu"><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ví dụ: Slide ngữ pháp bài 17" maxLength={200} /></Field><Field label="Gắn với buổi học"><select value={lessonId} onChange={(event) => setLessonId(event.target.value)} className="flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="">Tài liệu chung của lớp</option>{lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.label} · {lesson.date}</option>)}</select></Field><Field label="Mô tả"><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Nội dung hoặc ghi chú cho học viên..." rows={4} className="flex w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" /></Field></div><div className="flex flex-col rounded-xl border border-dashed border-emerald-200 bg-white p-4"><p className="text-sm font-medium text-slate-700">File tài liệu</p><p className="mt-1 text-xs leading-5 text-slate-400">Bắt buộc 1 file, tối đa 25 MB.</p><label className="mt-4 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg bg-emerald-50/70 px-4 text-center transition-colors hover:bg-emerald-50"><Upload className="size-6 text-emerald-500" /><span className="mt-2 text-sm font-medium text-emerald-700">Chọn file tài liệu</span><span className="mt-1 text-xs text-slate-400">PDF, Word, Excel, PowerPoint, ZIP, ảnh, audio hoặc video</span><input type="file" accept={materialAccept} className="sr-only" onChange={(event) => setFile(event.target.files?.[0] ?? null)} /></label>{file && <div className="mt-3"><FileChip file={file} /></div>}<div className="mt-auto flex justify-end gap-2 pt-5"><Button type="button" variant="ghost" onClick={onCancel}>Hủy</Button><Button type="submit" disabled={saving}>{saving && <LoaderCircle className="size-4 animate-spin" />}{saving ? 'Đang đăng...' : 'Đăng tài liệu'}</Button></div></div></form></CardContent></Card>;
}

function ContentList({ title, description, empty, count, children }: { title: string; description: string; empty: string; count: number; children: React.ReactNode }) {
  return <Card className="border-slate-200 shadow-sm"><CardHeader className="flex-row items-start justify-between border-b"><div><CardTitle className="text-base">{title}</CardTitle><p className="mt-1 text-xs text-slate-400">{description}</p></div><Badge variant="secondary">{count}</Badge></CardHeader><CardContent className="p-0">{count === 0 ? <p className="p-8 text-center text-sm text-slate-400">{empty}</p> : <div className="divide-y divide-slate-100">{children}</div>}</CardContent></Card>;
}

function AssignmentRow({ assignment, onDelete }: { assignment: TeacherClassContent['assignments'][number]; onDelete: () => void }) {
  return <div className="flex items-start gap-3 px-5 py-4"><div className="grid size-10 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-600"><Paperclip className="size-5" /></div><div className="min-w-0 flex-1"><p className="font-medium text-slate-700">{assignment.title}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{assignment.description || 'Không có mô tả.'}</p><div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500"><span className="flex items-center gap-1.5"><CalendarClock className="size-3.5" />Hạn {formatDate(assignment.dueAt)}</span><span>{assignment.submissionCount} bài đã nộp</span>{assignment.attachments.length > 0 && <span>{assignment.attachments.length} file đề bài</span>}</div></div><Button type="button" variant="ghost" size="sm" className="shrink-0 text-slate-400 hover:text-red-600" onClick={onDelete} aria-label={`Xóa ${assignment.title}`}><Trash2 className="size-4" /></Button></div>;
}

function MaterialRow({ material, onDelete }: { material: TeacherClassContent['materials'][number]; onDelete: () => void }) {
  return <div className="flex items-start gap-3 px-5 py-4"><div className="grid size-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500"><FileText className="size-5" /></div><div className="min-w-0 flex-1"><p className="font-medium text-slate-700">{material.title}</p><p className="mt-1 truncate text-xs text-slate-400">{material.fileName}</p><p className="mt-2 text-xs text-slate-500">{material.lessonTitle || 'Tài liệu chung của lớp'}{material.description ? ` · ${material.description}` : ''}</p>{material.downloadUrl ? <a href={material.downloadUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-xs font-semibold text-emerald-600 hover:underline">Mở tài liệu</a> : null}</div><Button type="button" variant="ghost" size="sm" className="shrink-0 text-slate-400 hover:text-red-600" onClick={onDelete} aria-label={`Xóa ${material.title}`}><Trash2 className="size-4" /></Button></div>;
}

function FileChip({ file }: { file: File }) {
  return <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600"><FileText className="size-4 shrink-0 text-emerald-600" /><span className="min-w-0 flex-1 truncate">{file.name}</span><span className="shrink-0 text-slate-400">{formatSize(file.size)}</span></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-2"><span className="text-xs font-medium text-slate-500">{label}</span>{children}</label>;
}

function LoadingCard() {
  return <div className="grid gap-5 xl:grid-cols-2"><Card><CardContent className="space-y-3 p-6"><div className="h-5 w-32 animate-pulse rounded bg-slate-100" /><div className="h-16 animate-pulse rounded bg-slate-100" /><div className="h-16 animate-pulse rounded bg-slate-100" /></CardContent></Card><Card><CardContent className="space-y-3 p-6"><div className="h-5 w-40 animate-pulse rounded bg-slate-100" /><div className="h-16 animate-pulse rounded bg-slate-100" /></CardContent></Card></div>;
}

function validateFiles(files: File[], maxFiles: number, maxSizeMb: number) {
  if (files.length > maxFiles) return `Bạn chỉ có thể chọn tối đa ${maxFiles} file.`;
  const oversized = files.find((file) => file.size > maxSizeMb * 1024 * 1024);
  return oversized ? `${oversized.name} vượt quá giới hạn ${maxSizeMb} MB.` : null;
}

function formatDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' }).format(parsed);
}

function formatSize(value: number) {
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function defaultDueAt() {
  const value = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  value.setMinutes(value.getMinutes() - value.getTimezoneOffset());
  return value.toISOString().slice(0, 16);
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Đã xảy ra lỗi. Vui lòng thử lại.';
}
