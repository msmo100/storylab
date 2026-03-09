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

const LINE_HEIGHTS = ['1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.75', '2'];
const LETTER_SPACINGS = ['-0.05', '-0.02', '0', '0.02', '0.05', '0.1', '0.15', '0.2'];

const SHADOW_PRESETS: { value: string; label: string }[] = [
  { value: '', label: 'Ingen' },
  { value: '0 1px 4px rgba(0,0,0,0.08),0 2px 8px rgba(0,0,0,0.06)', label: 'Lätt' },
  { value: '0 4px 16px rgba(0,0,0,0.12),0 8px 24px rgba(0,0,0,0.08)', label: 'Medium' },
  { value: '0 8px 32px rgba(0,0,0,0.18),0 16px 48px rgba(0,0,0,0.12)', label: 'Stark' },
  { value: '0 20px 60px rgba(0,0,0,0.28),0 32px 80px rgba(0,0,0,0.18)', label: 'Extra' },
];

const OUTLINE_WIDTHS = ['1px', '2px', '3px', '4px', '6px', '8px'];
const BORDER_RADII: { value: string; label: string }[] = [
  { value: '', label: 'Ingen' },
  { value: '4px', label: '4 px' },
  { value: '8px', label: '8 px' },
  { value: '12px', label: '12 px' },
  { value: '16px', label: '16 px' },
  { value: '24px', label: '24 px' },
  { value: '9999px', label: 'Rund' },
];

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

  function resetAll() {
    updateBlock(block.id, { styles: undefined } as Partial<Block>);
  }

  const hasAnyStyle = block.styles && Object.keys(block.styles).length > 0;
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
        <div className="flex items-center gap-2">
          {hasAnyStyle && (
            <button
              onClick={resetAll}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              title="Återställ alla stilar"
            >
              Återställ alla
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-base leading-none px-1"
            aria-label="Stäng stilpanel"
          >
            ✕
          </button>
        </div>
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
            <ColorRow
              label="Bakgrundsfärg"
              value={block.styles?.backgroundColor}
              onChange={(v) => update({ backgroundColor: v || undefined })}
              onReset={() => update({ backgroundColor: undefined })}
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

            {/* Line height */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Radavstånd</label>
              <select
                value={block.styles?.lineHeight ?? ''}
                onChange={(e) => update({ lineHeight: e.target.value || undefined })}
                className={`w-full ${INPUT_CLASS}`}
              >
                <option value="">Standard</option>
                {LINE_HEIGHTS.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            {/* Letter spacing */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Teckenavstånd</label>
              <select
                value={block.styles?.letterSpacing ?? ''}
                onChange={(e) => update({ letterSpacing: e.target.value || undefined })}
                className={`w-full ${INPUT_CLASS}`}
              >
                <option value="">Standard</option>
                {LETTER_SPACINGS.map((v) => (
                  <option key={v} value={v}>{v === '0' ? '0 (normal)' : `${v} em`}</option>
                ))}
              </select>
            </div>

          </div>
        </section>

        {/* DEKORATION */}
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
            Dekoration
          </p>
          <div className="flex flex-col gap-3">

            {/* Drop shadow */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Skugga</label>
              <select
                value={block.styles?.boxShadow ?? ''}
                onChange={(e) => update({ boxShadow: e.target.value || undefined })}
                className={`w-full ${INPUT_CLASS}`}
              >
                {SHADOW_PRESETS.map((p) => (
                  <option key={p.label} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Outline */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Kontur</label>
              <div className="flex gap-2 items-center">
                <div className="relative flex-shrink-0">
                  <input
                    type="color"
                    value={block.styles?.outlineColor ?? '#000000'}
                    onChange={(e) => update({ outlineColor: e.target.value, outlineWidth: block.styles?.outlineWidth ?? '2px' })}
                    className="w-8 h-8 rounded cursor-pointer border border-gray-200 dark:border-gray-700 bg-transparent p-0.5"
                    title="Konturfärg"
                  />
                  {!block.styles?.outlineColor && (
                    <div
                      className="absolute inset-0.5 rounded pointer-events-none"
                      style={{
                        backgroundImage:
                          'linear-gradient(45deg,#ccc 25%,transparent 25%),linear-gradient(-45deg,#ccc 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#ccc 75%),linear-gradient(-45deg,transparent 75%,#ccc 75%)',
                        backgroundSize: '6px 6px',
                        backgroundPosition: '0 0,0 3px,3px -3px,-3px 0px',
                        opacity: 0.6,
                      }}
                    />
                  )}
                </div>
                <select
                  value={block.styles?.outlineWidth ?? ''}
                  onChange={(e) => update({ outlineWidth: e.target.value || undefined })}
                  className={`flex-1 ${INPUT_CLASS}`}
                >
                  <option value="">Bredd</option>
                  {OUTLINE_WIDTHS.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
                {block.styles?.outlineColor && (
                  <button
                    onClick={() => update({ outlineColor: undefined, outlineWidth: undefined })}
                    className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex-shrink-0"
                    title="Återställ"
                  >
                    Återst.
                  </button>
                )}
              </div>
            </div>

            {/* Border radius */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Rundade hörn</label>
              <select
                value={block.styles?.borderRadius ?? ''}
                onChange={(e) => update({ borderRadius: e.target.value || undefined })}
                className={`w-full ${INPUT_CLASS}`}
              >
                {BORDER_RADII.map((r) => (
                  <option key={r.label} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

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
      <div className="relative">
        <input
          type="color"
          value={value ?? '#ffffff'}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border border-gray-200 dark:border-gray-700 bg-transparent p-0.5"
          title={label}
        />
        {/* Checkerboard overlay when no value is set */}
        {!value && (
          <div
            className="absolute inset-0.5 rounded pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
              backgroundSize: '6px 6px',
              backgroundPosition: '0 0, 0 3px, 3px -3px, -3px 0px',
              opacity: 0.6,
            }}
          />
        )}
      </div>
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
