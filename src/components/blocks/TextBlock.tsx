import type { TextBlock as TextBlockType } from '../../types';

// Backwards-compat: old enum values stored before the px migration
const LEGACY_PX: Record<string, string> = {
  sm: '14px', base: '16px', lg: '18px', xl: '20px', '2xl': '24px',
};

function resolveFontSize(s?: string): string | undefined {
  if (!s) return undefined;
  return LEGACY_PX[s] ?? `${s}px`;
}

interface Props {
  block: TextBlockType;
}

export function TextBlock({ block }: Props) {
  return (
    <div className="prose prose-lg max-w-none">
      <p
        style={{
          color: block.styles?.textColor,
          fontFamily: block.styles?.fontFamily,
          fontSize: resolveFontSize(block.styles?.fontSize),
        }}
      >
        {block.content}
      </p>
    </div>
  );
}
