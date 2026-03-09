import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useBuilderStore } from '../../store/builderStore';
import type { Block } from '../../types';
import { Button } from '../ui/Button';
import { BlockEditor } from './BlockEditor';
import { cn } from '../../utils/cn';

interface Props {
  block: Block;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: () => void;
}

const BLOCK_LABELS: Record<Block['type'], string> = {
  text: 'Text',
  image: 'Bild',
  video: 'Video',
  quote: 'Citat',
  hero: 'Hero',
  sticky: 'Klistrad',
  scrollmedia: 'Scroll',
  timeline: 'Tidslinje',
  chat: 'Chatt',
  carousel: 'Karusell',
};

const BLOCK_COLORS: Record<Block['type'], string> = {
  text: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  image: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  video: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  quote: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  hero: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  sticky: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
  scrollmedia: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  timeline: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
  chat: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  carousel: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
};


export function BlockCard({ block, isSelected, isFirst, isLast, onSelect }: Props) {
  const { removeBlock, duplicateBlock, moveBlockUp, moveBlockDown } = useBuilderStore();
  const [expanded, setExpanded] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'rounded-lg border bg-white dark:bg-gray-800 p-3 shadow-sm select-none',
          isSelected
            ? 'border-gray-400 dark:border-gray-500 ring-2 ring-gray-400 dark:ring-gray-500'
            : 'border-gray-200 dark:border-gray-700',
          isDragging && 'opacity-40'
        )}
      >
        <div className="group/row flex items-center gap-1.5">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            aria-label="Dra för att sortera om"
            className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 -ml-1 touch-none"
          >
            <DragIcon />
          </button>

          {/* Block type badge */}
          <span className={cn('flex-shrink-0 rounded px-2 py-0.5 text-xs font-semibold', BLOCK_COLORS[block.type])}>
            {BLOCK_LABELS[block.type]}
          </span>

          {/* Spacer */}
          <span className="flex-1" />

          {/* Move up / down — hover only */}
          <button
            onClick={() => moveBlockUp(block.id)}
            disabled={isFirst}
            aria-label="Flytta upp"
            title="Flytta upp"
            className="flex-shrink-0 opacity-0 group-hover/row:opacity-100 p-1 rounded text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-0 disabled:cursor-not-allowed transition-opacity text-xs leading-none"
          >
            ▲
          </button>
          <button
            onClick={() => moveBlockDown(block.id)}
            disabled={isLast}
            aria-label="Flytta ner"
            title="Flytta ner"
            className="flex-shrink-0 opacity-0 group-hover/row:opacity-100 p-1 rounded text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-0 disabled:cursor-not-allowed transition-opacity text-xs leading-none"
          >
            ▼
          </button>

          {/* Duplicate — hover only */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => duplicateBlock(block.id)}
            aria-label="Duplicera block"
            title="Duplicera"
            className="flex-shrink-0 opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            ⎘
          </Button>

          {/* Style / Edit / Delete — always visible */}
          <Button className="flex-shrink-0" variant="ghost" size="sm" onClick={onSelect} aria-pressed={isSelected}>
            Stil
          </Button>
          <Button
            className="flex-shrink-0"
            variant="ghost"
            size="sm"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            {expanded ? 'Stäng' : 'Redigera'}
          </Button>
          <Button
            className="flex-shrink-0"
            variant="danger"
            size="sm"
            onClick={() => removeBlock(block.id)}
            aria-label="Ta bort block"
          >
            ✕
          </Button>
        </div>

        {expanded && <BlockEditor block={block} />}
      </div>

    </>
  );
}

function DragIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="4" r="1.2" />
      <circle cx="11" cy="4" r="1.2" />
      <circle cx="5" cy="8" r="1.2" />
      <circle cx="11" cy="8" r="1.2" />
      <circle cx="5" cy="12" r="1.2" />
      <circle cx="11" cy="12" r="1.2" />
    </svg>
  );
}
