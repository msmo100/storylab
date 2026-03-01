import type { QuoteBlock as QuoteBlockType } from '../../types';

interface Props {
  block: QuoteBlockType;
}

export function QuoteBlock({ block }: Props) {
  return (
    <blockquote className="border-l-4 border-gray-400 pl-6 my-6">
      <p className="text-2xl font-serif italic">{block.text}</p>
      {block.attribution && (
        <cite className="mt-2 block text-sm text-gray-500 not-italic">— {block.attribution}</cite>
      )}
    </blockquote>
  );
}
