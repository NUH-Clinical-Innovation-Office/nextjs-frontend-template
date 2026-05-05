import type { ComponentProps } from 'react';
import { Label as LabelUI } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type LabelProps = ComponentProps<typeof LabelUI>;

export function LabelAtom({ className, ...props }: LabelProps) {
  return <LabelUI className={cn('cursor-pointer', className)} {...props} />;
}
