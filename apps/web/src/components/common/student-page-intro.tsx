import type { ReactNode } from 'react';

interface StudentPageIntroProps {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}

export function StudentPageIntro({ eyebrow, title, description, children }: StudentPageIntroProps) {
  return (
    <div className="mb-8 flex flex-col gap-5 border-b border-slate-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-600">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          {eyebrow}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>}
      </div>
      {children}
    </div>
  );
}
