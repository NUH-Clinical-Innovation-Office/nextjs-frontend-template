import type { ComponentProps } from 'react';
import { Switch as SwitchUI } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

type SwitchProps = ComponentProps<typeof SwitchUI>;

export function SwitchAtom({ className, ...props }: SwitchProps) {
  return <SwitchUI className={cn('cursor-pointer', className)} {...props} />;
}
