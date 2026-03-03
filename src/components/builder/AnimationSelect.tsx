import { Select } from '../ui/Select';
import type { AnimationPreset } from '../../types';

const options = [
  { value: 'none', label: 'Ingen animation' },
  { value: 'fade', label: 'Tona in' },
  { value: 'slide-up', label: 'Glid upp' },
  { value: 'slide-left', label: 'Glid från vänster' },
  { value: 'zoom', label: 'Zooma in' },
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
