import type { TextBlock as TextBlockType } from '../../types';

const FONT_SIZE_CLASS: Record<string, string> = {
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
};

interface Props {
  block: TextBlockType;
}

export function TextBlock({ block }: Props) {
  const sizeClass = FONT_SIZE_CLASS[block.styles?.fontSize ?? 'base'];
  return (
    <div className="prose prose-lg max-w-none">
      <p
        className={sizeClass}
        style={{
          color: block.styles?.textColor,
          fontFamily: block.styles?.fontFamily,
        }}
      >
        {block.content}
      </p>
    </div>
  );
}
