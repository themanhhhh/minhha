'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, CheckCircle2, Clock3, FileText, Paperclip, Upload } from 'lucide-react';
import { studentClassService } from '@/services';
import type { ClassWork, StudentAssignment, StudentAssignmentStatus } from '@/types';
import { cn } from '@/lib/utils';

const assignmentMeta: Record<StudentAssignmentStatus, { label: string; text: string }> = {
  PENDING: { label: 'Chưa nộp', text: 'text-slate-500' },
  OVERDUE: { label: 'Chưa nộp · quá hạn', text: 'text-amber-600' },
  SUBMITTED: { label: 'Đã nộp', text: 'text-emerald-600' },
  LATE: { label: 'Đã nộp trễ', text: 'text-amber-600' },
};

export function StudentAssignmentDetail({ initialAssignment, classId, className, referenceMaterials = [] }: { initialAssignment: StudentAssignment; classId: number; className: string; referenceMaterials?: ClassWork[] }) {
  const [assignment, setAssignment] = useState(initialAssignment);
  const [files, setFiles] = useState<File[]>([]);
  const [note, setNote] = useState(initialAssignment.submission?.note ?? '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workRef = useRef<HTMLElement>(null);
  const meta = assignmentMeta[assignment.status];
  const isOverdue = assignment.status === 'OVERDUE';

  async function submit() {
    if (!files.length) {
      setError('Hãy chọn ít nhất một tài liệu hoặc hình ảnh minh chứng trước khi nộp.');
      workRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const submission = await studentClassService.submitAssignment(assignment.id, files, note);
      setAssignment((current) => ({ ...current, status: submission.status, submission }));
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Không thể nộp bài. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  function selectFiles(nextFiles: File[]) {
    if (nextFiles.length > 5) {
      setError('Bạn chỉ có thể đính kèm tối đa 5 file.');
      return;
    }
    const oversizedFile = nextFiles.find((file) => file.size > 10 * 1024 * 1024);
    if (oversizedFile) {
      setError(`${oversizedFile.name} vượt quá giới hạn 10 MB.`);
      return;
    }
    setFiles(nextFiles);
    setError('');
  }

  return (
    <div className="-mx-4 -my-6 min-h-[calc(100vh-5rem)] border-t border-slate-200 bg-white px-6 py-7 sm:-mx-6 sm:-my-8 sm:px-10 sm:py-9 lg:-mx-10 lg:-my-10 lg:px-12 lg:py-10">
      <div className="mx-auto max-w-[1240px]">
        <header className="flex flex-wrap items-center justify-between gap-5">
          <Link href={`/student/classes/${classId}`} className="inline-flex items-center gap-3 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700">
            <ArrowLeft className="size-5" />
            Quay lại
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-4 text-sm">
            <BookOpen className="size-5 text-emerald-500" aria-label="Tài liệu bài tập" />
            <span className="flex items-center gap-2 text-slate-500">
              <Clock3 className="size-4 text-emerald-500" />
              <em className={cn('not-italic', meta.text)}>{meta.label}</em>
            </span>
            <button
              type="button"
              disabled={submitting}
              onClick={() => void submit()}
              className="inline-flex h-11 items-center rounded-md bg-emerald-500 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Đang nộp...' : isOverdue ? 'Nộp bài trễ' : 'Nộp bài'}
            </button>
          </div>
        </header>

        <div className="mt-14 grid gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,1fr)_230px]">
          <main className="max-w-[865px]">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-[34px]">{assignment.title}</h1>
              <p className="mt-3 text-base text-slate-500">Hạn nộp {formatDeadline(assignment.dueAt)} <span className="px-1.5">·</span> Cho phép nộp nhiều lần</p>
            </div>

            <section className="mt-9">
              <h2 className="text-base font-medium text-slate-700">Hướng dẫn</h2>
              <p className="mt-2 text-base leading-7 text-slate-500">{assignment.description || 'Không có hướng dẫn.'}</p>
            </section>

            <section className="mt-12">
              <h2 className="text-base font-medium text-slate-700">Tài liệu tham khảo</h2>
              {referenceMaterials.length > 0 ? <div className="mt-4 space-y-2">{referenceMaterials.map((material) => <div key={material.id} className="flex items-center gap-3 rounded-md border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700"><FileText className="size-5 shrink-0 text-orange-500" /><span className="min-w-0 flex-1 truncate font-medium">{material.title}</span><span className="text-slate-400">•••</span></div>)}</div> : <p className="mt-2 text-sm italic text-slate-400">Chưa có tài liệu tham khảo.</p>}
            </section>

            <section ref={workRef} id="my-work" className="mt-10 scroll-mt-6">
              <h2 className="text-base font-medium text-slate-700">Bài làm của tôi</h2>
              {assignment.submission && <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50/40 p-4"><div className="flex items-center gap-2 text-sm font-medium text-emerald-700"><CheckCircle2 className="size-4" />Đã nộp lúc {formatDeadline(assignment.submission.submittedAt)}{assignment.submission.status === 'LATE' && ' · Nộp trễ'}</div>{assignment.submission.note && <p className="mt-2 text-sm text-emerald-800/75">Ghi chú: {assignment.submission.note}</p>}<div className="mt-3 space-y-2">{assignment.submission.files.map((file) => file.downloadUrl ? <a key={file.id} href={file.downloadUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-md border border-emerald-200 bg-white px-3 py-2.5 text-sm text-emerald-700 transition-colors hover:bg-emerald-50"><FileText className="size-4 shrink-0" /><span className="truncate">{file.fileName}</span></a> : <span key={file.id} className="flex items-center gap-3 rounded-md border border-emerald-200 bg-white px-3 py-2.5 text-sm text-emerald-700"><FileText className="size-4 shrink-0" /><span className="truncate">{file.fileName}</span></span>)}</div></div>}
              <div className="mt-5 flex items-center gap-6"><label htmlFor="assignment-files" className="inline-flex cursor-pointer items-center gap-2 text-base font-medium text-emerald-600 transition-colors hover:text-emerald-700"><Paperclip className="size-5" />Đính kèm<input ref={fileInputRef} id="assignment-files" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(event) => selectFiles(Array.from(event.target.files ?? []))} /></label><span className="text-sm text-slate-400">Tối đa 5 file, 10 MB/file</span></div>
              {files.length > 0 && <div className="mt-4 space-y-2">{files.map((file) => <div key={`${file.name}-${file.lastModified}`} className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600"><FileText className="size-4 shrink-0 text-slate-400" /><span className="min-w-0 flex-1 truncate">{file.name}</span><span className="shrink-0 text-xs text-slate-400">{formatFileSize(file.size)}</span></div>)}</div>}
              <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ghi chú cho giáo viên (không bắt buộc)" rows={3} className="mt-5 w-full resize-none rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
              <div className="mt-5 flex justify-end"><button type="button" disabled={submitting} onClick={() => void submit()} className="inline-flex h-10 items-center gap-2 rounded-md bg-emerald-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"><Upload className="size-4" />{submitting ? 'Đang nộp...' : assignment.submission ? 'Nộp lại bài' : 'Nộp bài'}</button></div>
            </section>
          </main>

          <aside className="lg:pt-1">
            <p className="text-base font-medium text-slate-500">Điểm</p>
            <p className="mt-2 text-xl text-slate-900">Không chấm điểm</p>
            <p className="mt-10 text-sm leading-6 text-slate-400">Lớp học<br />{className}</p>
          </aside>
        </div>
      </div>
    </div>
  );
}

function formatDeadline(value: string) { const parsed = new Date(value); return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' }).format(parsed); }
function formatFileSize(value: number) { if (value < 1024 * 1024) return `${Math.ceil(value / 1024)} KB`; return `${(value / (1024 * 1024)).toFixed(1)} MB`; }
