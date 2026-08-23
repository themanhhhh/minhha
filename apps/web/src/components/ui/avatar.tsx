import { cn } from '@/lib/utils';
export function Avatar({ initials, className }: { initials: React.ReactNode; className?: string }) { return <div className={cn('grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary', className)}>{initials}</div>; }
