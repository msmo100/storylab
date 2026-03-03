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
}

const BLOCK_LABELS: Record<Block['type'], string> = {
  text: 'Text',
  image: 'Bild',
  video: 'Video',
  quote: 'Citat',
  hero: 'Hero',
  sticky: 'Klistrad',
  annotated: 'Annoterad',
  scrollmedia: 'Scrollmedia',
  timeline: 'Tidslinje',
};

const BLOCK_COLORS: Record<Block['type'], string> = {
  text: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  image: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  video: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  quote: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  hero: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  sticky: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
  annotated: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  scrollmedia: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  timeline: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
};

function blockPreview(block: Block): string {
  if (block.type === 'text') return block.content || 'Tomt textblock';
  if (block.type === 'image') return block.src || 'Ingen bild-URL angiven';
  if (block.type === 'video') return block.src || 'Ingen video-URL angiven';
  if (block.type === 'quote') return block.text || 'Tomt citat';
  if (block.type === 'hero') return block.heading || 'Ingen rubrik angiven';
  if (block.type === 'sticky')
    return block.overlays.length ? `${block.overlays.length} överlager` : 'Inga överlager';
  if (block.type === 'annotated')
    return block.annotations.length ? `${block.annotations.length} annoteringar` : 'Inga annoteringar';
  if (block.type === 'scrollmedia')
    return block.images.length ? `${block.images.length} ${block.images.length === 1 ? 'bild' : 'bilder'} — ${block.textPosition} text` : 'Inga bilder';
  if (block.type === 'timeline')
    return block.entries.length ? `${block.entries.length} ${block.entries.length === 1 ? 'händelse' : 'händelser'}` : 'Inga händelser';
  return '';
}

export function BlockCard({ block }: Props) {
  const { removeBlock } = useBuilderStore();
  const [expanded, setExpanded] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });
 
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 shadow-sm select-none',
        isDragging && 'opacity-40 ring-2 ring-gray-400'
      )}
    >
      <div className="flex items-center gap-2">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          aria-label="Dra för att sortera om"
          className="cursor-grab active:cursor-grabbing text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 -ml-1 touch-none"
        >
          <DragIcon />
        </button>

        {/* Block type badge */}
        <span className={cn('rounded px-2 py-0.5 text-xs font-semibold', BLOCK_COLORS[block.type])}>
          {BLOCK_LABELS[block.type]}
        </span>

        {/* Content preview */}
        <p className="flex-1 truncate text-sm text-gray-500 dark:text-gray-400">{blockPreview(block)}</p>

        {/* Actions */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {expanded ? 'Stäng' : 'Redigera'}
        </Button>
        <Button
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
