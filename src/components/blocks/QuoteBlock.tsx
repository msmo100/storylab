import type { QuoteBlock as QuoteBlockType } from '../../types';
import { resolveFontSize } from '../../utils/resolveFontSize';

interface Props {
  block: QuoteBlockType;
}

export function QuoteBlock({ block }: Props) {
  return (
    <blockquote
      className="border-l-4 pl-6 my-6"
      style={{
        borderColor: block.styles?.accentColor ?? '#9ca3af',
        boxShadow: block.styles?.boxShadow,
        outline: block.styles?.outlineColor
          ? `${block.styles.outlineWidth ?? '2px'} solid ${block.styles.outlineColor}`
          : undefined,
        borderRadius: block.styles?.borderRadius,
      }}
    >
      <p
        className="font-serif italic"
        style={{
          color: block.styles?.textColor,
          backgroundColor: block.styles?.backgroundColor,
          fontFamily: block.styles?.fontFamily,
          fontSize: resolveFontSize(block.styles?.fontSize) ?? '1.5rem',
          lineHeight: block.styles?.lineHeight,
          letterSpacing: block.styles?.letterSpacing ? `${block.styles.letterSpacing}em` : undefined,
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
