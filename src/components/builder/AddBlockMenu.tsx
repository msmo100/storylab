import { useState, useRef, useEffect, useCallback } from 'react';
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
    description: 'Ett stycke brödtext',
    emoji: '¶',
    defaultBlock: { type: 'text', animation: 'fade', animationDelay: 0, content: '' },
  },
  {
    label: 'Bild',
    description: 'Ett heltäckande foto med valfri bildtext',
    emoji: '⬜',
    defaultBlock: { type: 'image', animation: 'fade', animationDelay: 0, src: '', alt: '', caption: '' },
  },
  {
    label: 'Video',
    description: 'En video som spelas upp automatiskt i vyport',
    emoji: '▶',
    defaultBlock: { type: 'video', animation: 'none', animationDelay: 0, src: '', autoplay: true },
  },
  {
    label: 'Citat',
    description: 'Ett lyftat citat med valfri källa',
    emoji: '❝',
    defaultBlock: { type: 'quote', animation: 'slide-up', animationDelay: 0, text: '', attribution: '' },
  },
  {
    label: 'Hero',
    description: 'Helskärmsöppning med bakgrund',
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
    label: 'Klistrad sektion',
    description: 'Bakgrunden sitter fast medan texten rullar förbi',
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
    label: 'Tidslinje',
    description: 'Händelser med rubrik, tid och text längs en vertikal linje',
    emoji: '⏱',
    defaultBlock: {
      type: 'timeline',
      animation: 'fade',
      animationDelay: 0,
      entries: [],
    },
  },
  {
    label: 'Chatt',
    description: 'iPhone-liknande chattkonversation med avsändare och mottagare',
    emoji: '💬',
    defaultBlock: {
      type: 'chat',
      animation: 'fade',
      animationDelay: 0,
      messages: [],
    },
  },
  {
    label: 'Karusell',
    description: 'Svepbara videor eller bilder i rad',
    emoji: '🎠',
    defaultBlock: {
      type: 'carousel',
      animation: 'fade',
      animationDelay: 0,
      items: [],
    },
  },
  {
    label: 'ScrollyMedia',
    description: 'Scrollytelling med bilder/video och parallax — eget iframe-inbäddning',
    emoji: '🎬',
    defaultBlock: {
      type: 'scrollymedia',
      animation: 'none',
      slides: [],
    },
  },
];

export function AddBlockMenu() {
  const { addBlock, article } = useBuilderStore();
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // One block per article — hide the add button once a block exists
  const hasBlock = article.blocks.length > 0;

  const close = useCallback(() => {
    setOpen(false);
    setFocusedIndex(-1);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((i) => { const next = Math.min(i + 1, BLOCK_OPTIONS.length - 1); itemRefs.current[next]?.focus(); return next; });
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((i) => { const next = Math.max(i - 1, 0); itemRefs.current[next]?.focus(); return next; });
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, close]);

  useEffect(() => {
    if (open) setTimeout(() => { itemRefs.current[0]?.focus(); setFocusedIndex(0); }, 0);
  }, [open]);

  function handleAdd(option: BlockOption) {
    addBlock(option.defaultBlock);
    close();
  }

  if (hasBlock) return null;

  return (
    <div ref={menuRef} className="relative">
      <Button variant="primary" onClick={() => setOpen((v) => !v)} aria-haspopup="listbox" aria-expanded={open}>
        + Block
      </Button>

      {open && (
        <div
          role="listbox"
          aria-label="Välj blocktyp"
          className="absolute left-0 top-full mt-2 z-20 w-64 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 shadow-lg"
        >
          {BLOCK_OPTIONS.map((opt, i) => (
            <button
              key={opt.label}
              ref={(el) => { itemRefs.current[i] = el; }}
              role="option"
              aria-selected={focusedIndex === i}
              onClick={() => handleAdd(opt)}
              className="flex w-full items-start gap-3 rounded-lg p-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none transition-colors"
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
