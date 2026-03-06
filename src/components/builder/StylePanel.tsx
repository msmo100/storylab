import { useBuilderStore } from '../../store/builderStore';
import type { Block, BlockStyle } from '../../types';

interface Props {
  block: Block;
  onClose: () => void;
}

const ACCENT_TYPES: Block['type'][] = ['quote', 'timeline', 'hero', 'sticky', 'scrollmedia'];
const FONTSIZE_TYPES: Block['type'][] = ['text', 'quote'];

const FONTS: { value: string; label: string }[] = [
  { value: '', label: 'Standard (ärvd)' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: "'Palatino Linotype', Palatino, serif", label: 'Palatino' },
  { value: "'Times New Roman', serif", label: 'Times New Roman' },
  { value: "'Playfair Display', serif", label: 'Playfair Display' },
  { value: 'Merriweather, serif', label: 'Merriweather' },
  { value: 'Lora, serif', label: 'Lora' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: "'Trebuchet MS', sans-serif", label: 'Trebuchet MS' },
  { value: "'Space Grotesk', sans-serif", label: 'Space Grotesk' },
  { value: "'Courier New', monospace", label: 'Courier New' },
];

const PRESET_SIZES = [10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 28, 32, 36, 42, 48, 56, 64, 72, 96];

const INPUT_CLASS = 'text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-400';

export function StylePanel({ block, onClose }: Props) {
  const { updateBlock } = useBuilderStore();

  function update(patch: Partial<BlockStyle>) {
    const merged = { ...block.styles, ...patch };
    const cleaned = Object.fromEntries(
      Object.entries(merged).filter(([, v]) => v !== undefined)
    ) as BlockStyle;
    updateBlock(block.id, { styles: Object.keys(cleaned).length ? cleaned : undefined } as Partial<Block>);
  }

  const showAccent = ACCENT_TYPES.includes(block.type);
  const showFontSize = FONTSIZE_TYPES.includes(block.type);

  // fontSize stored as plain number string e.g. "16"
  const rawSize = block.styles?.fontSize ?? '';
  const numericSize = rawSize ? parseInt(rawSize, 10) : NaN;
  const isPreset = PRESET_SIZES.includes(numericSize);

  return (
    <div className="flex flex-col w-[272px] flex-shrink-0 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Stil</span>
        <button
          onClick={onClose}
          className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-base leading-none px-1"
          aria-label="Stäng stilpanel"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-col gap-6 px-4 py-4">

        {/* FÄRGER */}
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
            Färger
          </p>
          <div className="flex flex-col gap-3">
            <ColorRow
              label="Textfärg"
              value={block.styles?.textColor}
              onChange={(v) => update({ textColor: v || undefined })}
              onReset={() => update({ textColor: undefined })}
            />
            {showAccent && (
              <ColorRow
                label="Accentfärg"
                value={block.styles?.accentColor}
                onChange={(v) => update({ accentColor: v || undefined })}
                onReset={() => update({ accentColor: undefined })}
              />
            )}
          </div>
        </section>

        {/* TYPOGRAFI */}
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
            Typografi
          </p>
          <div className="flex flex-col gap-3">

            {/* Font family */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Teckensnitt</label>
              <select
                value={block.styles?.fontFamily ?? ''}
                onChange={(e) => update({ fontFamily: e.target.value || undefined })}
                className={`w-full ${INPUT_CLASS}`}
              >
                {FONTS.map((f) => (
                  <option key={f.value} value={f.value} style={{ fontFamily: f.value || undefined }}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Font size */}
            {showFontSize && (
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Storlek</label>
                <div className="flex gap-2">
                  {/* Preset dropdown */}
                  <select
                    value={isPreset ? String(numericSize) : ''}
                    onChange={(e) => update({ fontSize: e.target.value || undefined })}
                    className={`flex-1 ${INPUT_CLASS}`}
                  >
                    <option value="">— px</option>
                    {PRESET_SIZES.map((s) => (
                      <option key={s} value={String(s)}>{s} px</option>
                    ))}
                  </select>
                  {/* Custom number input */}
                  <input
                    type="number"
                    min={6}
                    max={200}
                    value={isNaN(numericSize) ? '' : numericSize}
                    onChange={(e) => update({ fontSize: e.target.value ? String(parseInt(e.target.value, 10)) : undefined })}
                    placeholder="px"
                    className={`w-16 text-center ${INPUT_CLASS}`}
                  />
                </div>
              </div>
            )}

          </div>
        </section>
      </div>
    </div>
  );
}

interface ColorRowProps {
  label: string;
  value: string | undefined;
  onChange: (v: string) => void;
  onReset: () => void;
}

function ColorRow({ label, value, onChange, onReset }: ColorRowProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="flex-1 text-xs text-gray-500 dark:text-gray-400">{label}</label>
      <input
        type="color"
        value={value ?? '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded cursor-pointer border border-gray-200 dark:border-gray-700 bg-transparent p-0.5"
        title={label}
      />
      {value && (
        <button
          onClick={onReset}
          className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          title="Återställ"
        >
          Återst.
        </button>
      )}
    </div>
  );
}
