import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { StickyBlock as StickyBlockType } from '../../types';

interface Props { block: StickyBlockType }

export function StickyBlock({ block }: Props) {
  const { overlays } = block;
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  return (
    <div
      ref={containerRef}
      style={{ height: `${(overlays.length + 1) * 100}vh` }}
    >
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
        {/* Background */}
        <div className="absolute inset-0">
          {block.backgroundType === 'video' ? (
            <video
              src={block.backgroundSrc}
              autoPlay muted loop playsInline
              className="w-full h-full object-cover"
              style={{ objectPosition: block.styles?.objectPosition }}
            />
          ) : (
            <img
              src={block.backgroundSrc}
              alt={block.backgroundAlt ?? ''}
              className="w-full h-full object-cover"
              style={{ objectPosition: block.styles?.objectPosition }}
            />
          )}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Text overlays */}
        {overlays.map((text, i) => {
          const start = (i) / (overlays.length + 1);
          const mid = (i + 0.5) / (overlays.length + 1);
          const end = (i + 1) / (overlays.length + 1);
          const opacity = useTransform(scrollYProgress, [start, mid, end], [0, 1, 0]);
          const y = useTransform(scrollYProgress, [start, end], ['40px', '-40px']);
          return (
            <motion.div
              key={i}
              style={{ opacity, y }}
              className="absolute inset-0 flex items-center justify-center px-8"
            >
              <p
                className="text-white text-center font-semibold drop-shadow-lg max-w-3xl"
                style={{ fontSize: block.styles?.fontSize ? `${block.styles.fontSize}px` : 'clamp(1.5rem, 4vw, 3rem)', lineHeight: 1.3, fontFamily: block.styles?.fontFamily }}
              >
                {text}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
