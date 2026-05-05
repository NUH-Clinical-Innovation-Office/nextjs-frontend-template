import type { ComponentProps } from 'react';
import { Select as SelectUI } from '@/components/ui/select';

type SelectProps = ComponentProps<typeof SelectUI>;

export function SelectAtom(props: SelectProps) {
  return <SelectUI {...props} />;
}
