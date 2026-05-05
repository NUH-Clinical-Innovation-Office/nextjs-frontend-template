import { Label as LabelUI } from '@/components/ui/label';
import { createAtom } from '@/lib/atom';

export const LabelAtom = createAtom(LabelUI, { cursorPointer: false });
