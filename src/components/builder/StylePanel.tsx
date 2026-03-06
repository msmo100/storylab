import { useBuilderStore } from '../../store/builderStore';
import type { Block, BlockStyle } from '../../types';

interface Props {
  block: Block;
  onClose: () => void;
}

// Accent color is relevant for these block types
const ACCENT_TYPES: Block['type'][] = ['quote', 'timeline', 'hero', 'sticky', 'scrollmedia'];
// Font size is relevant for these block types
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

const FONT_SIZES: { value: BlockStyle['fontSize']; label: string }[] = [
  { value: 'sm', label: 'S' },
  { value: 'base', label: 'M' },
  { value: 'lg', label: 'L' },
  { value: 'xl', label: 'XL' },
  { value: '2xl', label: 'XXL' },
];

export function StylePanel({ block, onClose }: Props) {
  const { updateBlock } = useBuilderStore();

  function update(patch: Partial<BlockStyle>) {
    const merged = { ...block.styles, ...patch };
    // Remove undefined keys so the object stays clean
    const cleaned = Object.fromEntries(
      Object.entries(merged).filter(([, v]) => v !== undefined)
    ) as BlockStyle;
    updateBlock(block.id, { styles: Object.keys(cleaned).length ? cleaned : undefined } as Partial<Block>);
  }

  const showAccent = ACCENT_TYPES.includes(block.type);
  const showFontSize = FONTSIZE_TYPES.includes(block.type);

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
                className="w-full text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-400"
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
                <div className="flex gap-1">
                  {FONT_SIZES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => update({ fontSize: block.styles?.fontSize === s.value ? undefined : s.value })}
                      className={[
                        'flex-1 py-1 rounded text-xs font-medium border transition-colors',
                        block.styles?.fontSize === s.value
                          ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100'
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500',
                      ].join(' ')}
                    >
                      {s.label}
                    </button>
                  ))}
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
