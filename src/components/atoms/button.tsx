import type { ComponentProps } from 'react';
import { buttonVariants, Button as ShadcnButton } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export { buttonVariants };

type ButtonProps = ComponentProps<typeof ShadcnButton>;

export function Button({ className, ...props }: ButtonProps) {
  return <ShadcnButton className={cn('cursor-pointer', className)} {...props} />;
}
