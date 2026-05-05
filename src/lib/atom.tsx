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
        className={cn(cursorPointer ? 'cursor-pointer' : 'cursor-text', className)}
        // biome-ignore lint/suspicious/noExplicitAny: spread rest props which may not have className
        {...(rest as any)}
      />
    );
  };
}
