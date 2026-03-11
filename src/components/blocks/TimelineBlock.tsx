import { motion } from 'framer-motion';
import type { TimelineBlock as TimelineBlockType, TimelineDotStyle } from '../../types';

interface Props { block: TimelineBlockType }

function Dot({ style }: { style: TimelineDotStyle }) {
  if (style === 'none') return null;
  const base = 'w-3 h-3 rounded-full flex-shrink-0';
  if (style === 'ring') return <div className={`${base} border-2 border-gray-400 dark:border-gray-500`} />;
  if (style === 'diamond') return <div className="w-3 h-3 flex-shrink-0 bg-gray-400 dark:bg-gray-500 rotate-45" />;
  return <div className={`${base} bg-gray-400 dark:bg-gray-500`} />;
}

export function TimelineBlock({ block }: Props) {
  const lineWidth = block.lineWidth ?? 2;
  return (
    <div style={{ maxWidth: block.maxWidth ?? '720px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div className="relative">
        <div
          className="absolute left-[5px] top-0 bottom-0 bg-gray-200 dark:bg-gray-700"
          style={{ width: lineWidth }}
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
                <Dot style={entry.dotStyle ?? 'filled'} />
              </div>
              <div>
                {entry.time && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{entry.time}</p>
                )}
                {entry.title && (
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{entry.title}</h3>
                )}
                {entry.text && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{entry.text}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
