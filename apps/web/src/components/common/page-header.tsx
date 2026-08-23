import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: { label: string; onClick?: () => void } }) {
  return <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="mb-2 flex items-center gap-1 text-xs font-medium text-muted-foreground"><span>Riki LMS</span><ChevronRight className="size-3" /><span>{eyebrow ?? title}</span></div><h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>{description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}</div>{action && <Button onClick={action.onClick}>{action.label}</Button>}</div>;
}
