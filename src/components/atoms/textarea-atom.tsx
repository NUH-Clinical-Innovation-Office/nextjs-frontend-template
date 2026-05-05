import type { ComponentProps } from 'react';
import { Textarea as TextareaUI } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type TextareaProps = ComponentProps<typeof TextareaUI>;

export function TextareaAtom({ className, ...props }: TextareaProps) {
  return <TextareaUI className={cn('cursor-pointer', className)} {...props} />;
}
