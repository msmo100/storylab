import type { QuoteBlock as QuoteBlockType } from '../../types';

const LEGACY_PX: Record<string, string> = {
  sm: '14px', base: '16px', lg: '18px', xl: '20px', '2xl': '24px',
};

function resolveFontSize(s?: string): string | undefined {
  if (!s) return undefined;
  return LEGACY_PX[s] ?? `${s}px`;
}

interface Props {
  block: QuoteBlockType;
}

export function QuoteBlock({ block }: Props) {
  return (
    <blockquote
      className="border-l-4 pl-6 my-6"
      style={{ borderColor: block.styles?.accentColor ?? '#9ca3af' }}
    >
      <p
        className="font-serif italic"
        style={{
          color: block.styles?.textColor,
          fontFamily: block.styles?.fontFamily,
          fontSize: resolveFontSize(block.styles?.fontSize) ?? '1.5rem',
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
