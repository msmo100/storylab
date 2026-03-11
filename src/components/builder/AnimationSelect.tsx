import type { AnimationPreset } from '../../types';
import { useBuilderStore } from '../../store/builderStore';

const OPTIONS: { value: AnimationPreset; label: string }[] = [
  { value: 'none',       label: 'Ingen' },
  { value: 'fade',       label: 'Tona in' },
  { value: 'slide-up',   label: 'Glid upp' },
  { value: 'slide-left', label: 'Glid från vänster' },
  { value: 'zoom',       label: 'Zooma in' },
];

interface Props {
  blockId: string;
  value: AnimationPreset;
}

export function AnimationSelect({ blockId, value }: Props) {
  const { setAnimation } = useBuilderStore();
  return (
    <select
      value={value}
      onChange={(e) => setAnimation(blockId, e.target.value as AnimationPreset)}
      className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
    >
      {OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
