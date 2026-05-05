import type { ComponentProps } from 'react';
import { Slider as SliderUI } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

type SliderProps = ComponentProps<typeof SliderUI>;

export function SliderAtom({ className, ...props }: SliderProps) {
  return <SliderUI className={cn('cursor-pointer', className)} {...props} />;
}
