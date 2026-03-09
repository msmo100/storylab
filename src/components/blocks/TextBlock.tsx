import type { TextBlock as TextBlockType } from '../../types';
import { resolveFontSize } from '../../utils/resolveFontSize';

interface Props {
  block: TextBlockType;
}

export function TextBlock({ block }: Props) {
  return (
    <div className="prose prose-lg max-w-none">
      <p
        style={{
          color: block.styles?.textColor,
          backgroundColor: block.styles?.backgroundColor,
          fontFamily: block.styles?.fontFamily,
          fontSize: resolveFontSize(block.styles?.fontSize),
          lineHeight: block.styles?.lineHeight,
          letterSpacing: block.styles?.letterSpacing ? `${block.styles.letterSpacing}em` : undefined,
          boxShadow: block.styles?.boxShadow,
          outline: block.styles?.outlineColor
            ? `${block.styles.outlineWidth ?? '2px'} solid ${block.styles.outlineColor}`
            : undefined,
          borderRadius: block.styles?.borderRadius,
          padding: (block.styles?.boxShadow || block.styles?.outlineColor || block.styles?.borderRadius) ? '0.75em 1em' : undefined,
        }}
      >
        {block.content}
      </p>
    </div>
  );
}
