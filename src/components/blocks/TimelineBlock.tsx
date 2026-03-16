import { motion } from 'framer-motion';
import type { TimelineBlock as TimelineBlockType, TimelineDotStyle } from '../../types';

interface Props { block: TimelineBlockType }

function Dot({ style, color }: { style: TimelineDotStyle; color?: string }) {
  if (style === 'none') return null;
  const c = color ?? '#9ca3af'; // gray-400 fallback
  const base = 'w-3 h-3 rounded-full flex-shrink-0';
  if (style === 'ring') return <div className={base} style={{ border: `2px solid ${c}` }} />;
  if (style === 'diamond') return <div className="w-3 h-3 flex-shrink-0 rotate-45" style={{ backgroundColor: c }} />;
  return <div className={base} style={{ backgroundColor: c }} />;
}

export function TimelineBlock({ block }: Props) {
  const lineWidth = block.lineWidth ?? 2;
  const accentColor = block.styles?.accentColor;
  return (
    <div style={{ maxWidth: block.maxWidth ?? '720px', margin: '0 auto', padding: '2rem 1.5rem', backgroundColor: block.styles?.backgroundColor, color: block.styles?.textColor, fontFamily: block.styles?.fontFamily, fontWeight: block.styles?.fontWeight, fontStyle: block.styles?.fontStyle, fontSize: block.styles?.fontSize ? `${block.styles.fontSize}px` : undefined }}>
      <div className="relative">
        <div
          className={accentColor ? undefined : 'absolute top-0 bottom-0 bg-gray-200'}
          style={{ position: 'absolute', left: 6, top: 0, bottom: 0, width: lineWidth, transform: 'translateX(-50%)', backgroundColor: accentColor ?? undefined }}
        />
        <div className="flex flex-col gap-8">
          {block.entries.map((entry) => (
            <motion.div
              key={entry.id}
              initial={block.entryAnimation ? { opacity: 0, x: -16 } : false}
              whileInView={block.entryAnimation ? { opacity: 1, x: 0 } : undefined}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4 }}
              className="flex gap-4 pl-6"
            >
              <div className="absolute left-0 mt-1">
                <Dot style={entry.dotStyle ?? 'filled'} color={accentColor} />
              </div>
              <div>
                {entry.title && (
                  <h3 className="font-semibold mb-0.5" style={{ color: block.styles?.textColor ?? '#111827' }}>{entry.title}</h3>
                )}
                {entry.time && (
                  <p className="text-xs mb-1" style={{ color: block.styles?.textColor ? `${block.styles.textColor}99` : '#9ca3af' }}>{entry.time}</p>
                )}
                {entry.text && (
                  <p className="text-sm leading-relaxed" style={{ color: block.styles?.textColor ? `${block.styles.textColor}cc` : '#4b5563' }}>{entry.text}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
