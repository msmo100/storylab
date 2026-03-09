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
        }}
      >
        {block.content}
      </p>
    </div>
  );
}
