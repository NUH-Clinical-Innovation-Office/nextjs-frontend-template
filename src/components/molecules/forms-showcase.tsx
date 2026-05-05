'use client';

import { useState } from 'react';
import { CheckboxAtom } from '@/components/atoms/checkbox-atom';
import { InputAtom } from '@/components/atoms/input-atom';
import { LabelAtom } from '@/components/atoms/label-atom';
import { RadioGroupAtom, RadioGroupItemAtom } from '@/components/atoms/radio-group-atom';
import { SectionLabel } from '@/components/atoms/section-label';
import { SliderAtom } from '@/components/atoms/slider-atom';
import { SwitchAtom } from '@/components/atoms/switch-atom';
import { TextareaAtom } from '@/components/atoms/textarea-atom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export function FormsShowcase() {
  const [selectValue, setSelectValue] = useState('');
  const [selectedCheckbox, setSelectedCheckbox] = useState(false);
  const [selectedRadio, setSelectedRadio] = useState('option-1');
  const [toggleState, setToggleState] = useState(false);
  const [sliderValue, setSliderValue] = useState([50]);
  const [toggleBold, setToggleBold] = useState(false);

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-2xl font-semibold">Forms</h2>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          <SectionLabel>Input</SectionLabel>
          <div className="flex flex-wrap gap-3">
            <InputAtom placeholder="Patient name" className="w-48" />
            <InputAtom placeholder="Disabled" disabled className="w-48" />
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <SectionLabel>Textarea</SectionLabel>
          <TextareaAtom placeholder="Clinical notes..." className="w-full sm:w-96 min-h-20" />
        </div>
        <div className="flex flex-col gap-6">
          <SectionLabel>Label with Input</SectionLabel>
          <div className="flex flex-col gap-2 w-64">
            <LabelAtom htmlFor="email">Email address</LabelAtom>
            <InputAtom id="email" placeholder="doctor@nuh.com.sg" />
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <SectionLabel>Select</SectionLabel>
          <Select value={selectValue} onValueChange={setSelectValue}>
            <SelectTrigger className="w-60">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cardiology">Cardiology</SelectItem>
              <SelectItem value="neurology">Neurology</SelectItem>
              <SelectItem value="oncology">Oncology</SelectItem>
              <SelectItem value="paediatrics">Paediatrics</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-6">
          <SectionLabel>Checkbox</SectionLabel>
          <div className="flex items-center gap-3">
            <CheckboxAtom
              id="consent"
              checked={selectedCheckbox}
              onCheckedChange={(checked: boolean) => setSelectedCheckbox(checked)}
            />
            <LabelAtom htmlFor="consent">Clinical data consent</LabelAtom>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <SectionLabel>Radio Group</SectionLabel>
          <RadioGroupAtom value={selectedRadio} onValueChange={setSelectedRadio}>
            <div className="flex items-center gap-3">
              <RadioGroupItemAtom value="low" id="r-low" />
              <LabelAtom htmlFor="r-low">Low priority</LabelAtom>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItemAtom value="normal" id="r-normal" />
              <LabelAtom htmlFor="r-normal">Normal priority</LabelAtom>
            </div>
          </RadioGroupAtom>
        </div>
        <div className="flex flex-col gap-6">
          <SectionLabel>Switch</SectionLabel>
          <div className="flex items-center gap-3">
            <SwitchAtom checked={toggleState} onCheckedChange={setToggleState} id="notifications" />
            <LabelAtom htmlFor="notifications">
              {toggleState ? 'Notifications enabled' : 'Notifications disabled'}
            </LabelAtom>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <SectionLabel>Slider — {sliderValue}</SectionLabel>
          <SliderAtom
            value={sliderValue}
            onValueChange={setSliderValue}
            max={100}
            step={1}
            className="w-64"
          />
        </div>
        <div className="flex flex-col gap-6">
          <SectionLabel>Toggle</SectionLabel>
          <div className="flex items-center gap-3">
            <Toggle pressed={toggleBold} onPressedChange={setToggleBold}>
              Bold
            </Toggle>
            <Toggle>Italic</Toggle>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <SectionLabel>Toggle Group</SectionLabel>
          <ToggleGroup type="multiple" defaultValue={['bold']}>
            <ToggleGroupItem value="bold">B</ToggleGroupItem>
            <ToggleGroupItem value="italic">I</ToggleGroupItem>
            <ToggleGroupItem value="center">≡</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </section>
  );
}
