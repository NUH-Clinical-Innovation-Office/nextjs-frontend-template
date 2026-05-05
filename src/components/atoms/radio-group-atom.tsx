import type { ComponentProps } from 'react';
import {
  RadioGroupItem as RadioGroupItemUI,
  RadioGroup as RadioGroupUI,
} from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

type RadioGroupProps = ComponentProps<typeof RadioGroupUI>;
type RadioGroupItemProps = ComponentProps<typeof RadioGroupItemUI>;

export function RadioGroupAtom({ className, ...props }: RadioGroupProps) {
  return <RadioGroupUI className={cn('cursor-pointer', className)} {...props} />;
}

export function RadioGroupItemAtom({ className, ...props }: RadioGroupItemProps) {
  return <RadioGroupItemUI className={cn('cursor-pointer', className)} {...props} />;
}
