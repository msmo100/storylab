import { useState, useRef, useEffect } from 'react';
import { useBuilderStore } from '../../store/builderStore';
import type { BlockWithoutId } from '../../types';
import { Button } from '../ui/Button';

type BlockOption = {
  label: string;
  description: string;
  emoji: string;
  defaultBlock: BlockWithoutId;
};

const BLOCK_OPTIONS: BlockOption[] = [
  {
    label: 'Text',
    description: 'A paragraph of body text',
    emoji: '¶',
    defaultBlock: { type: 'text', animation: 'fade', animationDelay: 0, content: '' },
  },
  {
    label: 'Image',
    description: 'A full-width photo with optional caption',
    emoji: '⬜',
    defaultBlock: { type: 'image', animation: 'fade', animationDelay: 0, src: '', alt: '', caption: '' },
  },
  {
    label: 'Video',
    description: 'A video that autoplays in viewport',
    emoji: '▶',
    defaultBlock: { type: 'video', animation: 'none', animationDelay: 0, src: '', autoplay: true },
  },
  {
    label: 'Quote',
    description: 'A pull quote with optional attribution',
    emoji: '❝',
    defaultBlock: { type: 'quote', animation: 'slide-up', animationDelay: 0, text: '', attribution: '' },
  },
  {
    label: 'Hero',
    description: 'Full-screen opening section with background',
    emoji: '◼',
    defaultBlock: {
      type: 'hero',
      animation: 'none',
      backgroundType: 'image',
      backgroundSrc: '',
      heading: '',
      subheading: '',
    },
  },
  {
    label: 'Sticky section',
    description: 'Background stays fixed as text scrolls over it',
    emoji: '📌',
    defaultBlock: {
      type: 'sticky',
      animation: 'none',
      backgroundType: 'image',
      backgroundSrc: '',
      backgroundAlt: '',
      overlays: [],
    },
  },
  {
    label: 'Annotated media',
    description: 'Pin text labels to specific points on an image or video',
    emoji: '🔍',
    defaultBlock: {
      type: 'annotated',
      animation: 'none',
      backgroundType: 'image',
      backgroundSrc: '',
      backgroundAlt: '',
      annotations: [],
    },
  },
  {
    label: 'Scroll media',
    description: 'Text stays fixed while images scroll past beside it',
    emoji: '↕',
    defaultBlock: {
      type: 'scrollmedia',
      animation: 'none',
      text: '',
      textPosition: 'center',
      textEntrance: 'none',
      mediaType: 'image',
      images: [],
    },
  },
];

export function AddBlockMenu() {
  const { addBlock } = useBuilderStore();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  function handleAdd(option: BlockOption) {
    addBlock(option.defaultBlock);
    setOpen(false);
  }

  return (
    <div ref={menuRef} className="relative">
      <Button variant="primary" onClick={() => setOpen((v) => !v)}>
        <span aria-hidden="true">+</span> Add block
      </Button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-20 w-64 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 shadow-lg">
          {BLOCK_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => handleAdd(opt)}
              className="flex w-full items-start gap-3 rounded-lg p-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="mt-0.5 text-lg leading-none w-5 text-center">{opt.emoji}</span>
              <span>
                <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">{opt.label}</span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">{opt.description}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
