import { motion, useReducedMotion } from 'framer-motion';
import type { TimelineBlock as TimelineBlockType, TimelineDotStyle } from '../../types';

interface Props {
  block: TimelineBlockType;
}

function Dot({ style }: { style: TimelineDotStyle }) {
  if (style === 'none') return null;

  if (style === 'ring') {
    return (
      <div
        className="absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 border-current bg-white"
        aria-hidden="true"
      />
    );
  }

  if (style === 'solid') {
    return (
      <div
        className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-current"
        aria-hidden="true"
      />
    );
  }

  if (style === 'diamond') {
    return (
      <div
        className="absolute left-0 top-1.5 w-6 h-6 flex items-center justify-center"
        aria-hidden="true"
      >
        <div className="w-3.5 h-3.5 bg-current rotate-45" />
      </div>
    );
  }

  // 'filled' — default: outer ring with inner dot
  return (
    <div
      className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white border-2 border-current flex items-center justify-center"
      aria-hidden="true"
    >
      <div className="w-2 h-2 rounded-full bg-current" />
    </div>
  );
}

export function TimelineBlock({ block }: Props) {
  const prefersReducedMotion = useReducedMotion();

  if (block.entries.length === 0) {
    return (
      <p className="text-gray-400 italic text-sm">Inga tidslinjehändelser ännu.</p>
    );
  }

  const lineWidth = block.lineWidth ?? 1;
  const accentColor = block.styles?.accentColor;
  const textColor = block.styles?.textColor;
  const s = block.styles ?? {};
  const hasDecor = s.boxShadow || s.outlineColor || s.borderRadius || s.backgroundColor;

  return (
    <div
      className="relative"
      style={{
        color: textColor,
        backgroundColor: s.backgroundColor,
        fontFamily: s.fontFamily,
        fontSize: s.fontSize ? `${s.fontSize}px` : undefined,
        lineHeight: s.lineHeight,
        letterSpacing: s.letterSpacing ? `${s.letterSpacing}em` : undefined,
        boxShadow: s.boxShadow,
        outline: s.outlineColor ? `${s.outlineWidth ?? '2px'} solid ${s.outlineColor}` : undefined,
        borderRadius: s.borderRadius,
        padding: hasDecor ? '1rem' : undefined,
      }}
    >
      {/* Vertical line */}
      <div
        className="absolute top-2 bottom-2 opacity-20"
        style={{
          left: '0.75rem',
          width: `${lineWidth}px`,
          transform: 'translateX(-50%)',
          backgroundColor: accentColor ?? 'currentColor',
        }}
        aria-hidden="true"
      />

      <ol className="flex flex-col gap-8">
        {block.entries.map((entry, i) => {
          const dotStyle: TimelineDotStyle = !entry.showDot && entry.showDot !== undefined
            ? 'none'
            : (entry.dotStyle ?? 'filled');

          const Tag = block.entryAnimation && !prefersReducedMotion ? motion.li : 'li';
          const animProps = block.entryAnimation && !prefersReducedMotion
            ? {
                initial: { opacity: 0, y: 16 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true, amount: 0.2 },
                transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0, 0.25, 1] as const },
              }
            : {};

          return (
            <Tag
              key={entry.id}
              className="relative pl-10"
              {...animProps}
            >
              {/* Dot inherits accentColor via `color` on this wrapper */}
              <div style={{ color: accentColor }}>
                <Dot style={dotStyle} />
              </div>

              {/* Header: title + time */}
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 mb-1">
                <h3 className="text-base font-bold leading-snug">
                  {entry.title || <span className="opacity-40 italic font-normal">Ingen rubrik</span>}
                </h3>
                {entry.time && (
                  <time className="text-xs font-medium opacity-50 shrink-0">
                    {entry.time}
                  </time>
                )}
              </div>

              {/* Body text */}
              {entry.text && (
                <p className="text-sm opacity-70 leading-relaxed break-words">
                  {entry.text}
                </p>
              )}
            </Tag>
          );
        })}
      </ol>
    </div>
  );
}
