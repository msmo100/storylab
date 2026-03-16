import { useBuilderStore } from '../../store/builderStore';
import type { Block, BlockStyle } from '../../types';
import { Button } from '../ui/Button';

const INPUT = 'w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400';
const LABEL = 'block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1';

// Which style controls apply to each block type
const SUPPORTS_MAX_WIDTH      = ['image', 'video', 'quote', 'timeline', 'chat', 'carousel', 'scrollymedia'];
const SUPPORTS_TEXT_COLOR     = ['quote', 'timeline'];
const SUPPORTS_BG_COLOR       = ['quote', 'timeline', 'chat'];
const SUPPORTS_ACCENT         = ['quote', 'timeline', 'chat'];
const SUPPORTS_FONT           = ['quote', 'hero', 'sticky', 'timeline', 'chat', 'carousel', 'image', 'scrollymedia'];
const SUPPORTS_FONT_SIZE      = ['quote', 'hero', 'sticky', 'timeline', 'chat', 'carousel', 'image', 'scrollymedia'];
const SUPPORTS_LINE_HEIGHT    = ['quote'];
const SUPPORTS_LETTER_SPACING = ['quote'];
const SUPPORTS_BORDER_RADIUS  = ['image', 'video', 'quote', 'carousel'];
const SUPPORTS_BOX_SHADOW     = ['image', 'quote'];
const SUPPORTS_OBJECT_POS     = ['image', 'video', 'hero', 'sticky'];

const GP_PALETTE = [
  { name: 'Blue',      colors: ['#0A324B', '#0A5582', '#4A728A', '#80A3B9', '#CDDDE8', '#E8EFF5'] },
  { name: 'Green',     colors: ['#024B3A', '#006950', '#408877', '#78B0A2', '#C0DAD4', '#ECF3F2'] },
  { name: 'Graphite',  colors: ['#183D45', '#305158', '#5B757B', '#97A8AB', '#CED6D8', '#E8EDEE'] },
  { name: 'Plum',      colors: ['#672F55', '#EDD3E7', '#F3ECF3'] },
];

function ColorSwatches({ onSelect, current }: { onSelect: (hex: string) => void; current?: string }) {
  return (
    <div className="flex flex-col gap-1 mb-2">
      {GP_PALETTE.map((family) => (
        <div key={family.name} className="flex gap-1">
          {family.colors.map((hex) => (
            <button
              key={hex}
              type="button"
              title={hex}
              onClick={() => onSelect(hex)}
              style={{ backgroundColor: hex }}
              className={`w-6 h-6 rounded flex-shrink-0 border transition-transform hover:scale-110 ${
                current?.toLowerCase() === hex.toLowerCase()
                  ? 'border-gray-900 dark:border-white ring-1 ring-gray-900 dark:ring-white'
                  : 'border-black/10 dark:border-white/10'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

const GP_FONTS = ['GP Sans', 'GP Serif'] as const;

const GP_WEIGHTS = [
  { label: 'Light',      value: '300' },
  { label: 'Book',       value: '350' },
  { label: 'Regular',    value: '400' },
  { label: 'Medium',     value: '500' },
  { label: 'SemiBold',   value: '600' },
  { label: 'Bold',       value: '700' },
  { label: 'ExtraBold',  value: '800' },
  { label: 'Black',      value: '900' },
];

const FONT_PRESETS = [
  { label: 'Standard',        value: undefined,                     stack: 'inherit' },
  { label: 'GP Sans',         value: 'GP Sans',                     stack: "'GP Sans', sans-serif" },
  { label: 'GP Serif',        value: 'GP Serif',                    stack: "'GP Serif', serif" },
  { label: 'Playfair',        value: "'Playfair Display', serif",   stack: "'Playfair Display', serif" },
  { label: 'Merriweather',    value: 'Merriweather, serif',         stack: 'Merriweather, serif' },
  { label: 'Lora',            value: 'Lora, serif',                 stack: 'Lora, serif' },
  { label: 'Space Grotesk',   value: "'Space Grotesk', sans-serif", stack: "'Space Grotesk', sans-serif" },
  { label: 'Georgia',         value: 'Georgia, serif',              stack: 'Georgia, serif' },
  { label: 'Arial',           value: 'Arial, sans-serif',           stack: 'Arial, sans-serif' },
];

interface Props {
  block: Block;
  onClose: () => void;
}

export function StylePanel({ block, onClose }: Props) {
  const { updateBlock } = useBuilderStore();

  function setStyle(updates: Partial<BlockStyle>) {
    updateBlock(block.id, { styles: { ...block.styles, ...updates } });
  }

  function clearStyle(key: keyof BlockStyle) {
    const next = { ...block.styles };
    delete next[key];
    updateBlock(block.id, { styles: next });
  }

  const t = block.type;
  const currentFont = block.styles?.fontFamily;
  const isPreset = FONT_PRESETS.some((p) => p.value === currentFont);
  const isGPFont = GP_FONTS.some((f) => currentFont === f);

  return (
    <div className="flex flex-col w-72 flex-shrink-0 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-y-auto">
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Stil</span>
        <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
      </header>

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Max width */}
        {SUPPORTS_MAX_WIDTH.includes(t) && (
          <div>
            <label className={LABEL}>Max-bredd (t.ex. 800px, 60vw)</label>
            <input
              type="text"
              value={block.maxWidth ?? ''}
              onChange={(e) => updateBlock(block.id, { maxWidth: e.target.value || undefined })}
              placeholder="Standard"
              className={INPUT}
            />
          </div>
        )}

        {/* Text color */}
        {SUPPORTS_TEXT_COLOR.includes(t) && (
          <div>
            <label className={LABEL}>Textfärg</label>
            <ColorSwatches onSelect={(hex) => setStyle({ textColor: hex })} current={block.styles?.textColor} />
            <div className="flex gap-2">
              <input type="color" value={block.styles?.textColor ?? '#000000'} onChange={(e) => setStyle({ textColor: e.target.value })} className="h-8 w-10 rounded cursor-pointer border border-gray-200 dark:border-gray-600" />
              <input type="text" value={block.styles?.textColor ?? ''} onChange={(e) => setStyle({ textColor: e.target.value || undefined })} placeholder="#000000" className={INPUT} />
              <button onClick={() => clearStyle('textColor')} className="text-xs text-gray-400 hover:text-red-500">✕</button>
            </div>
          </div>
        )}

        {/* Background color */}
        {SUPPORTS_BG_COLOR.includes(t) && (
          <div>
            <label className={LABEL}>Bakgrundsfärg</label>
            <ColorSwatches onSelect={(hex) => setStyle({ backgroundColor: hex })} current={block.styles?.backgroundColor} />
            <div className="flex gap-2">
              <input type="color" value={block.styles?.backgroundColor ?? '#ffffff'} onChange={(e) => setStyle({ backgroundColor: e.target.value })} className="h-8 w-10 rounded cursor-pointer border border-gray-200 dark:border-gray-600" />
              <input type="text" value={block.styles?.backgroundColor ?? ''} onChange={(e) => setStyle({ backgroundColor: e.target.value || undefined })} placeholder="#ffffff" className={INPUT} />
              <button onClick={() => clearStyle('backgroundColor')} className="text-xs text-gray-400 hover:text-red-500">✕</button>
            </div>
          </div>
        )}

        {/* Accent color */}
        {SUPPORTS_ACCENT.includes(t) && (
          <div>
            <label className={LABEL}>Accentfärg</label>
            <ColorSwatches onSelect={(hex) => setStyle({ accentColor: hex })} current={block.styles?.accentColor} />
            <div className="flex gap-2">
              <input type="color" value={block.styles?.accentColor ?? '#6366f1'} onChange={(e) => setStyle({ accentColor: e.target.value })} className="h-8 w-10 rounded cursor-pointer border border-gray-200 dark:border-gray-600" />
              <input type="text" value={block.styles?.accentColor ?? ''} onChange={(e) => setStyle({ accentColor: e.target.value || undefined })} placeholder="#6366f1" className={INPUT} />
              <button onClick={() => clearStyle('accentColor')} className="text-xs text-gray-400 hover:text-red-500">✕</button>
            </div>
          </div>
        )}

        {/* Font family */}
        {SUPPORTS_FONT.includes(t) && (
          <div>
            <label className={LABEL}>Typsnitt</label>
            <div className="grid grid-cols-2 gap-1 mb-2">
              {FONT_PRESETS.map((preset) => {
                const active = preset.value === currentFont || (preset.value === undefined && !currentFont);
                return (
                  <button
                    key={preset.label}
                    onClick={() => setStyle({ fontFamily: preset.value })}
                    className={`px-2 py-1.5 rounded-lg border text-sm text-left truncate transition-colors ${
                      active
                        ? 'border-gray-800 dark:border-gray-200 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                        : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    style={{ fontFamily: preset.stack }}
                    title={preset.value ?? 'Standard'}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
            {/* GP font weight + italic controls */}
            {isGPFont && (
              <div className="flex flex-col gap-2">
                <select
                  value={block.styles?.fontWeight ?? '400'}
                  onChange={(e) => setStyle({ fontWeight: e.target.value })}
                  className={INPUT}
                  style={{ fontFamily: currentFont, fontWeight: block.styles?.fontWeight ?? '400' }}
                >
                  {GP_WEIGHTS.map((w) => (
                    <option key={w.value} value={w.value} style={{ fontWeight: w.value }}>
                      {w.label}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={block.styles?.fontStyle === 'italic'}
                    onChange={(e) => setStyle({ fontStyle: e.target.checked ? 'italic' : 'normal' })}
                    className="rounded"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400 italic">Kursiv</span>
                </label>
              </div>
            )}
            {!isPreset && currentFont && (
              <input
                type="text"
                value={currentFont}
                onChange={(e) => setStyle({ fontFamily: e.target.value || undefined })}
                placeholder="Eget typsnitt…"
                className={INPUT}
              />
            )}
            <button
              onClick={() => {
                const custom = prompt('Ange CSS font-family:');
                if (custom) setStyle({ fontFamily: custom });
              }}
              className="mt-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              + Eget typsnitt
            </button>
          </div>
        )}

        {/* Font size */}
        {SUPPORTS_FONT_SIZE.includes(t) && (
          <div>
            <label className={LABEL}>Teckenstorlek (px)</label>
            <input type="number" min={8} max={96} value={block.styles?.fontSize ?? ''} onChange={(e) => setStyle({ fontSize: e.target.value || undefined })} placeholder="Standard" className={INPUT} />
          </div>
        )}

        {/* Line height */}
        {SUPPORTS_LINE_HEIGHT.includes(t) && (
          <div>
            <label className={LABEL}>Radavstånd</label>
            <input type="number" min={1} max={3} step={0.1} value={block.styles?.lineHeight ?? ''} onChange={(e) => setStyle({ lineHeight: e.target.value || undefined })} placeholder="1.5" className={INPUT} />
          </div>
        )}

        {/* Letter spacing */}
        {SUPPORTS_LETTER_SPACING.includes(t) && (
          <div>
            <label className={LABEL}>Teckenavstånd (em)</label>
            <input type="number" min={-0.1} max={0.5} step={0.01} value={block.styles?.letterSpacing ?? ''} onChange={(e) => setStyle({ letterSpacing: e.target.value || undefined })} placeholder="0" className={INPUT} />
          </div>
        )}

        {/* Border radius */}
        {SUPPORTS_BORDER_RADIUS.includes(t) && (
          <div>
            <label className={LABEL}>Avrundning (t.ex. 8px)</label>
            <input type="text" value={block.styles?.borderRadius ?? ''} onChange={(e) => setStyle({ borderRadius: e.target.value || undefined })} placeholder="0px" className={INPUT} />
          </div>
        )}

        {/* Box shadow */}
        {SUPPORTS_BOX_SHADOW.includes(t) && (
          <div>
            <label className={LABEL}>Skugga (CSS box-shadow)</label>
            <input type="text" value={block.styles?.boxShadow ?? ''} onChange={(e) => setStyle({ boxShadow: e.target.value || undefined })} placeholder="0 4px 12px rgba(0,0,0,0.15)" className={INPUT} />
          </div>
        )}

        {/* Object position */}
        {SUPPORTS_OBJECT_POS.includes(t) && (
          <div>
            <label className={LABEL}>Bildobjektposition (t.ex. top center)</label>
            <input type="text" value={block.styles?.objectPosition ?? ''} onChange={(e) => setStyle({ objectPosition: e.target.value || undefined })} placeholder="center center" className={INPUT} />
          </div>
        )}
      </div>
    </div>
  );
}
