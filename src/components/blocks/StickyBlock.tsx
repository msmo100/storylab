import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import type { StickyBlock as StickyBlockType } from '../../types';

interface Props {
  block: StickyBlockType;
}

/**
 * One text overlay. Uses Framer Motion's useTransform to derive its opacity and
 * vertical position from the shared scroll progress of the parent container.
 */
function OverlayText({
  text,
  index,
  total,
  scrollYProgress,
}: {
  text: string;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  const slotSize = 1 / total;
  const slotStart = index * slotSize;
  const slotEnd = (index + 1) * slotSize;
  const fade = slotSize * 0.08; // faster transitions
  const isFirst = index === 0;
  const isLast = index === total - 1;

  // First overlay is visible immediately on section entry
  const opacity = useTransform(
    scrollYProgress,
    [slotStart, slotStart + fade, slotEnd - fade, slotEnd],
    [isFirst ? 1 : 0, 1, 1, isLast ? 1 : 0]
  );

  // First overlay starts at rest (no initial offset); subsequent ones slide up on entry
  const y = useTransform(
    scrollYProgress,
    [slotStart, slotStart + fade],
    [isFirst ? '0rem' : '1.5rem', '0rem']
  );

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 flex items-center justify-center px-8"
    >
      <p className="text-white text-2xl md:text-4xl font-semibold text-center leading-snug max-w-2xl drop-shadow-lg">
        {text}
      </p>
    </motion.div>
  );
}

export function StickyBlock({ block }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // IntersectionObserver drives video autoplay/pause
  const { ref: stickyRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.1,
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

  // useScroll tracks progress through the full container height
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const { overlays, backgroundType, backgroundSrc } = block;
  // Each overlay gets 100vh of scroll room; minimum 100vh even with no overlays
  const containerHeightVh = Math.max(overlays.length, 1) * 100;

  return (
    <div ref={containerRef} style={{ height: `${containerHeightVh}vh` }}>
      <div ref={stickyRef} className="sticky top-0 h-screen overflow-hidden">
        {/* Background */}
        {backgroundType === 'image' ? (
          <img
            src={backgroundSrc || 'https://placehold.co/1920x1080/111827/111827'}
            alt={block.backgroundAlt || ''}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            src={backgroundSrc}
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Overlay texts */}
        <div className="absolute inset-0">
          {overlays.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-white/40 text-base">No overlays added yet</p>
            </div>
          ) : (
            overlays.map((text, i) => (
              <OverlayText
                key={i}
                text={text}
                index={i}
                total={overlays.length}
                scrollYProgress={scrollYProgress}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
