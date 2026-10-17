'use client';

import { BellRing, Send, X } from 'lucide-react';
import { useState } from 'react';
import { notificationService } from '@/services';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function ClassBroadcastForm({ classId }: { classId: number }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !body.trim()) { setMessage({ type: 'error', text: 'Vui lòng nhập tiêu đề và nội dung thông báo.' }); return; }
    setSaving(true);
    setMessage(null);
    try {
      const result = await notificationService.broadcast({ classId, title: title.trim(), body: body.trim(), actionUrl: `/student/classes/${classId}` });
      setTitle('');
      setBody('');
      setMessage({ type: 'success', text: `Đã gửi thông báo cho ${result.recipientCount} học viên.` });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Không thể gửi thông báo.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="border-emerald-200 bg-emerald-50/30 shadow-sm">
      <CardHeader className="flex-row items-center justify-between gap-4 border-b border-emerald-100">
        <div><CardTitle className="flex items-center gap-2 text-base"><BellRing className="size-4 text-emerald-600" />Thông báo cho lớp</CardTitle><p className="mt-1 text-xs text-slate-500">Gửi thông báo trực tiếp tới các học viên đang theo học.</p></div>
        <Button type="button" variant={open ? 'secondary' : 'outline'} size="sm" onClick={() => { setOpen((value) => !value); setMessage(null); }}>{open ? <><X className="size-4" />Đóng</> : <><Send className="size-4" />Gửi thông báo</>}</Button>
      </CardHeader>
      {open && <CardContent className="pt-5"><form className="space-y-4" onSubmit={(event) => void submit(event)}><label className="block space-y-2"><span className="text-xs font-medium text-slate-500">Tiêu đề</span><Input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} placeholder="Ví dụ: Thay đổi lịch học tuần này" /></label><label className="block space-y-2"><span className="text-xs font-medium text-slate-500">Nội dung</span><textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={5000} rows={4} placeholder="Nhập nội dung cần gửi cho học viên..." className="flex w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring" /></label>{message && <p className={`rounded-lg border px-3 py-2 text-xs ${message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>{message.text}</p>}<div className="flex justify-end"><Button type="submit" disabled={saving}>{saving ? 'Đang gửi...' : <><Send className="size-4" />Gửi cho cả lớp</>}</Button></div></form></CardContent>}
    </Card>
  );
}
