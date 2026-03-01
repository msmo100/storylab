import { Select } from '../ui/Select';
import type { AnimationPreset } from '../../types';

const options = [
  { value: 'none', label: 'No animation' },
  { value: 'fade', label: 'Fade in' },
  { value: 'slide-up', label: 'Slide up' },
  { value: 'slide-left', label: 'Slide from left' },
  { value: 'zoom', label: 'Zoom in' },
];

interface Props {
  value: AnimationPreset;
  onChange: (value: AnimationPreset) => void;
}

export function AnimationSelect({ value, onChange }: Props) {
  return (
    <Select
      label="Animation"
      id="animation-select"
      value={value}
      options={options}
      onChange={(e) => onChange(e.target.value as AnimationPreset)}
    />
  );
}
