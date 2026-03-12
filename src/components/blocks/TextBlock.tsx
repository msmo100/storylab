import type { TextBlock as TextBlockType } from '../../types';

interface Props { block: TextBlockType }

export function TextBlock({ block }: Props) {
  const style: React.CSSProperties = {
    maxWidth: block.maxWidth ?? '720px',
    margin: '0 auto',
    padding: '1.5rem 1.5rem',
    color: block.styles?.textColor,
    backgroundColor: block.styles?.backgroundColor,
    fontFamily: block.styles?.fontFamily,
    fontSize: block.styles?.fontSize ? `${block.styles.fontSize}px` : undefined,
    lineHeight: block.styles?.lineHeight,
    letterSpacing: block.styles?.letterSpacing ? `${block.styles.letterSpacing}em` : undefined,
  };
  return (
    <div style={style}>
      <div
        className="prose prose-neutral max-w-none"
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
    </div>
  );
}
