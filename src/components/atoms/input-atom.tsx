import { Input as InputUI } from '@/components/ui/input';
import { createAtom } from '@/lib/atom';

export const InputAtom = createAtom(InputUI, { cursorPointer: false });
