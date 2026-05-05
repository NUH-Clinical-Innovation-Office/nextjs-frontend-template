import { Textarea as TextareaUI } from '@/components/ui/textarea';
import { createAtom } from '@/lib/atom';

export const TextareaAtom = createAtom(TextareaUI, { cursorPointer: false });
