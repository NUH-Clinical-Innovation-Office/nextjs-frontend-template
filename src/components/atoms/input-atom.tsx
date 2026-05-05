import type { ComponentProps } from 'react';
import { Input as InputUI } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type InputProps = ComponentProps<typeof InputUI>;

export function InputAtom({ className, ...props }: InputProps) {
  return <InputUI className={cn('cursor-pointer', className)} {...props} />;
}
