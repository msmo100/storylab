import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import type { HeroBlock as HeroBlockType } from '../../types';

interface Props {
  block: HeroBlockType;
}

export function HeroBlock({ block }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { ref: wrapperRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.3,
    triggerOnce: false,
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isIntersecting) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isIntersecting]);

  return (
    <div
      ref={wrapperRef}
      className="relative h-screen w-full overflow-hidden flex items-center justify-center"
    >
      {/* Background */}
      {block.backgroundType === 'image' ? (
        <img
          src={block.backgroundSrc || 'https://placehold.co/1920x1080/1a1a1a/1a1a1a'}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <video
          ref={videoRef}
          src={block.backgroundSrc}
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/70" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 }}
        className="relative z-10 text-center text-white max-w-3xl px-6"
      >
        <h1
          className="text-5xl md:text-7xl font-bold leading-tight tracking-tight drop-shadow-md"
          style={{ color: block.styles?.accentColor }}
        >
          {block.heading || 'Hero heading'}
        </h1>
        {block.subheading && (
          <p className="mt-6 text-xl md:text-2xl text-white/80 font-light leading-relaxed">
            {block.subheading}
          </p>
        )}
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/60"
        aria-hidden="true"
      >
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
        >
          <ChevronDown />
        </motion.div>
      </motion.div>
    </div>
  );
}

function ChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 6 8 10 12 6" />
    </svg>
  );
}
