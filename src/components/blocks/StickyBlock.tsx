import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import type { StickyBlock as StickyBlockType, BlockStyle } from '../../types';

interface Props { block: StickyBlockType }

interface OverlayProps {
  text: string;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
  styles?: BlockStyle;
}

function StickyOverlay({ text, index, total, scrollYProgress, styles }: OverlayProps) {
  const start = index / (total + 1);
  const mid = (index + 0.5) / (total + 1);
  const end = (index + 1) / (total + 1);
  const opacity = useTransform(scrollYProgress, [start, mid, end], [0, 1, 0]);
  const y = useTransform(scrollYProgress, [start, end], ['40px', '-40px']);
  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 flex items-center justify-center px-8"
    >
      <p
        className="text-white text-center font-semibold drop-shadow-lg max-w-3xl"
        style={{ fontSize: styles?.fontSize ? `${styles.fontSize}px` : 'clamp(1.5rem, 4vw, 3rem)', lineHeight: 1.3, fontFamily: styles?.fontFamily, fontWeight: styles?.fontWeight, fontStyle: styles?.fontStyle }}
      >
        {text}
      </p>
    </motion.div>
  );
}

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
        {overlays.map((text, i) => (
          <StickyOverlay
            key={i}
            text={text}
            index={i}
            total={overlays.length}
            scrollYProgress={scrollYProgress}
            styles={block.styles}
          />
        ))}
      </div>
    </div>
  );
}
