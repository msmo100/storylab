import type { QuoteBlock as QuoteBlockType } from '../../types';

const FONT_SIZE_CLASS: Record<string, string> = {
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
};

interface Props {
  block: QuoteBlockType;
}

export function QuoteBlock({ block }: Props) {
  const sizeClass = FONT_SIZE_CLASS[block.styles?.fontSize ?? '2xl'];
  return (
    <blockquote
      className="border-l-4 pl-6 my-6"
      style={{ borderColor: block.styles?.accentColor ?? '#9ca3af' }}
    >
      <p
        className={`${sizeClass} font-serif italic`}
        style={{
          color: block.styles?.textColor,
          fontFamily: block.styles?.fontFamily,
        }}
      >
        {block.text}
      </p>
      {block.attribution && (
        <cite className="mt-2 block text-sm text-gray-500 not-italic">— {block.attribution}</cite>
      )}
    </blockquote>
  );
}
