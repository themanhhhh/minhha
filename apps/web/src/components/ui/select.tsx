import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Select = React.forwardRef<HTMLSelectElement, React.ComponentProps<'select'>>(({ className, ...props }, ref) => (
  <span className="relative block">
    <select ref={ref} className={cn('flex h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-9 text-sm text-slate-700 shadow-sm outline-none transition-colors hover:border-emerald-300 focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400', className)} {...props} />
    <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
  </span>
));
Select.displayName = 'Select';
