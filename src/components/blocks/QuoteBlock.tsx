import type { QuoteBlock as QuoteBlockType } from '../../types';

interface Props { block: QuoteBlockType }

export function QuoteBlock({ block }: Props) {
  const style: React.CSSProperties = {
    maxWidth: block.maxWidth ?? '680px',
    margin: '0 auto',
    padding: '2rem 2rem',
    color: block.styles?.textColor,
    backgroundColor: block.styles?.backgroundColor,
    borderRadius: block.styles?.borderRadius,
    boxShadow: block.styles?.boxShadow,
    borderLeft: `4px solid ${block.styles?.accentColor ?? '#6366f1'}`,
  };
  return (
    <blockquote style={style}>
      <p
        className="text-xl leading-relaxed italic"
        style={{
          fontFamily: block.styles?.fontFamily,
          fontWeight: block.styles?.fontWeight,
          fontStyle: block.styles?.fontStyle,
          fontSize: block.styles?.fontSize ? `${block.styles.fontSize}px` : undefined,
          lineHeight: block.styles?.lineHeight,
          letterSpacing: block.styles?.letterSpacing ? `${block.styles.letterSpacing}em` : undefined,
        }}
      >
        {block.text}
      </p>
      {block.attribution && (
        <footer className="mt-3 text-sm text-gray-500 not-italic">
          — {block.attribution}
        </footer>
      )}
    </blockquote>
  );
}
