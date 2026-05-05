import type { ComponentType } from 'react';
import { cn } from '@/lib/utils';

type AtomOptions = {
  cursorPointer?: boolean;
};

export function createAtom<Props extends object>(
  Component: ComponentType<Props>,
  { cursorPointer = true }: AtomOptions = {},
) {
  return function Atom({ className, ...rest }: Props & { className?: string }) {
    return (
      <Component
        className={cn(cursorPointer ? 'cursor-pointer' : 'cursor-text', className) as string}
        {...(rest as Props)}
      />
    );
  };
}
