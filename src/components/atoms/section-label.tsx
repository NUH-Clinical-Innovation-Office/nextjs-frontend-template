import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SectionLabelProps = {
  children: ReactNode;
  className?: string;
};

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <span
      className={cn('text-xs font-medium uppercase tracking-wide text-muted-foreground', className)}
    >
      {children}
    </span>
  );
}
