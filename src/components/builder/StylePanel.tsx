import { useBuilderStore } from '../../store/builderStore';
import type { Block, BlockStyle } from '../../types';
import { Button } from '../ui/Button';

const INPUT = 'w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400';
const LABEL = 'block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1';

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

  return (
    <div className="flex flex-col w-72 flex-shrink-0 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-y-auto">
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Stil</span>
        <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
      </header>

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Max width */}
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

        {/* Text color */}
        <div>
          <label className={LABEL}>Textfärg</label>
          <div className="flex gap-2">
            <input type="color" value={block.styles?.textColor ?? '#000000'} onChange={(e) => setStyle({ textColor: e.target.value })} className="h-8 w-10 rounded cursor-pointer border border-gray-200 dark:border-gray-600" />
            <input type="text" value={block.styles?.textColor ?? ''} onChange={(e) => setStyle({ textColor: e.target.value || undefined })} placeholder="#000000" className={INPUT} />
            <button onClick={() => clearStyle('textColor')} className="text-xs text-gray-400 hover:text-red-500">✕</button>
          </div>
        </div>

        {/* Background color */}
        <div>
          <label className={LABEL}>Bakgrundsfärg</label>
          <div className="flex gap-2">
            <input type="color" value={block.styles?.backgroundColor ?? '#ffffff'} onChange={(e) => setStyle({ backgroundColor: e.target.value })} className="h-8 w-10 rounded cursor-pointer border border-gray-200 dark:border-gray-600" />
            <input type="text" value={block.styles?.backgroundColor ?? ''} onChange={(e) => setStyle({ backgroundColor: e.target.value || undefined })} placeholder="#ffffff" className={INPUT} />
            <button onClick={() => clearStyle('backgroundColor')} className="text-xs text-gray-400 hover:text-red-500">✕</button>
          </div>
        </div>

        {/* Accent color */}
        <div>
          <label className={LABEL}>Accentfärg</label>
          <div className="flex gap-2">
            <input type="color" value={block.styles?.accentColor ?? '#6366f1'} onChange={(e) => setStyle({ accentColor: e.target.value })} className="h-8 w-10 rounded cursor-pointer border border-gray-200 dark:border-gray-600" />
            <input type="text" value={block.styles?.accentColor ?? ''} onChange={(e) => setStyle({ accentColor: e.target.value || undefined })} placeholder="#6366f1" className={INPUT} />
            <button onClick={() => clearStyle('accentColor')} className="text-xs text-gray-400 hover:text-red-500">✕</button>
          </div>
        </div>

        {/* Font family */}
        <div>
          <label className={LABEL}>Typsnitt</label>
          <input type="text" value={block.styles?.fontFamily ?? ''} onChange={(e) => setStyle({ fontFamily: e.target.value || undefined })} placeholder="Georgia, serif" className={INPUT} />
        </div>

        {/* Font size */}
        <div>
          <label className={LABEL}>Teckenstorlek (px)</label>
          <input type="number" min={8} max={96} value={block.styles?.fontSize ?? ''} onChange={(e) => setStyle({ fontSize: e.target.value || undefined })} placeholder="16" className={INPUT} />
        </div>

        {/* Line height */}
        <div>
          <label className={LABEL}>Radavstånd</label>
          <input type="number" min={1} max={3} step={0.1} value={block.styles?.lineHeight ?? ''} onChange={(e) => setStyle({ lineHeight: e.target.value || undefined })} placeholder="1.5" className={INPUT} />
        </div>

        {/* Border radius */}
        <div>
          <label className={LABEL}>Avrundning (t.ex. 8px)</label>
          <input type="text" value={block.styles?.borderRadius ?? ''} onChange={(e) => setStyle({ borderRadius: e.target.value || undefined })} placeholder="0px" className={INPUT} />
        </div>

        {/* Object position (image/video) */}
        {(block.type === 'image' || block.type === 'video' || block.type === 'hero' || block.type === 'sticky') && (
          <div>
            <label className={LABEL}>Bildobjektposition (t.ex. top center)</label>
            <input type="text" value={block.styles?.objectPosition ?? ''} onChange={(e) => setStyle({ objectPosition: e.target.value || undefined })} placeholder="center center" className={INPUT} />
          </div>
        )}
      </div>
    </div>
  );
}
