import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="grid min-h-screen lg:grid-cols-[.9fr_1.1fr]"><div className="hidden flex-col justify-between bg-slate-950 p-10 text-white lg:flex"><Link href="/login" className="flex items-center gap-3 font-bold tracking-tight"><span className="grid size-9 place-items-center rounded-lg bg-emerald-500">R</span>RIKI LMS</Link><div><BookOpen className="mb-6 size-10 text-emerald-400" /><p className="max-w-md text-4xl font-semibold leading-tight tracking-tight">Nơi mọi tiến bộ trong học tập đều được nhìn thấy.</p><p className="mt-5 max-w-md text-sm leading-6 text-slate-400">Hệ thống quản lý đào tạo dành cho học viên, giáo viên và đội ngũ Riki.</p></div><p className="text-xs text-slate-500">© 2026 Riki Japanese Language Center</p></div><div className="flex items-center justify-center bg-slate-50 p-6">{children}</div></div>;
}
