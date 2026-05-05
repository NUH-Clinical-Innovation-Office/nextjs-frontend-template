import {
  RadioGroupItem as RadioGroupItemUI,
  RadioGroup as RadioGroupUI,
} from '@/components/ui/radio-group';
import { createAtom } from '@/lib/atom';

export const RadioGroupAtom = createAtom(RadioGroupUI);
export const RadioGroupItemAtom = createAtom(RadioGroupItemUI);
