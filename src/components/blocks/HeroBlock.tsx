import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { HeroBlock as HeroBlockType } from '../../types';

interface Props { block: HeroBlockType }

export function HeroBlock({ block }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div ref={ref} className="relative h-screen overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        {block.backgroundType === 'video' ? (
          <video
            src={block.backgroundSrc}
            autoPlay muted loop playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: block.styles?.objectPosition }}
          />
        ) : (
          <img
            src={block.backgroundSrc}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: block.styles?.objectPosition }}
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>
      <motion.div
        style={{ opacity }}
        className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6"
      >
        {block.heading && (
          <h1
            className="text-white font-bold drop-shadow-lg"
            style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)', lineHeight: 1.1 }}
          >
            {block.heading}
          </h1>
        )}
        {block.subheading && (
          <p className="text-white/80 mt-4 text-xl max-w-2xl drop-shadow">
            {block.subheading}
          </p>
        )}
      </motion.div>
    </div>
  );
}
