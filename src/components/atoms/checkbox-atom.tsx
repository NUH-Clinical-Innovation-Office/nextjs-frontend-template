import type { ComponentProps } from 'react';
import { Checkbox as CheckboxUI } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

type CheckboxProps = ComponentProps<typeof CheckboxUI>;

export function CheckboxAtom({ className, ...props }: CheckboxProps) {
  return <CheckboxUI className={cn('cursor-pointer', className)} {...props} />;
}
