import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import type { AnnotatedBlock as AnnotatedBlockType, Annotation } from '../../types';
import { cn } from '../../utils/cn';

interface Props {
  block: AnnotatedBlockType;
}

/**
 * A single annotation marker positioned at (x%, y%) on the background.
 * Fades in at its scroll slot, drifts slightly upward while visible, then fades out.
 * The text bubble is placed in whichever quadrant has the most room.
 */
function AnnotationMarker({
  annotation,
  index,
  total,
  scrollYProgress,
}: {
  annotation: Annotation;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  const slotSize = 1 / total;
  const slotStart = index * slotSize;
  const slotEnd = (index + 1) * slotSize;
  // Smaller fade window = faster transitions; first item already visible on entry
  const fade = slotSize * 0.08;
  const isFirst = index === 0;
  const isLast = index === total - 1;

  const opacity = useTransform(
    scrollYProgress,
    [slotStart, slotStart + fade, slotEnd - fade, slotEnd],
    [isFirst ? 1 : 0, 1, 1, isLast ? 1 : 0]
  );

  // Subtle upward drift — starts neutral for the first annotation (already visible on entry)
  const y = useTransform(
    scrollYProgress,
    [slotStart, slotEnd],
    [isFirst ? '0rem' : '0.5rem', '-0.5rem']
  );

  const dotScale = useTransform(
    scrollYProgress,
    [slotStart, slotStart + fade],
    [isFirst ? 1 : 0, 1]
  );

  // Place the bubble in the quadrant with the most space
  const toLeft = annotation.x > 55;
  const toTop = annotation.y > 60;

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${annotation.x}%`,
        top: `${annotation.y}%`,
        x: '-50%',
        y: '-50%',
        opacity,
        zIndex: 10 + index,
      }}
    >
      {/* Dot */}
      <motion.div
        style={{ scale: dotScale }}
        className="relative w-4 h-4 flex items-center justify-center"
      >
        <div className="w-3 h-3 rounded-full bg-white shadow-lg ring-2 ring-white/50" />
        {/* Pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-full bg-white/70"
          animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeOut' }}
        />
      </motion.div>

      {/* Text bubble — positioned in the open quadrant */}
      <motion.div
        style={{ y }}
        className={cn(
          'absolute w-52 rounded-xl bg-white/95 backdrop-blur-sm px-3 py-2.5 shadow-2xl text-sm text-gray-900 leading-snug',
          toLeft ? 'right-5' : 'left-5',
          toTop ? 'bottom-1' : 'top-1'
        )}
      >
        {/* Connector line */}
        <div
          className={cn(
            'absolute top-3 w-4 h-px bg-gray-300',
            toLeft ? 'right-full' : 'left-full'
          )}
        />
        {annotation.text || <span className="text-gray-400 italic">No text</span>}
      </motion.div>
    </motion.div>
  );
}

export function AnnotatedBlock({ block }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const { annotations, backgroundType, backgroundSrc } = block;
  const n = Math.max(annotations.length, 1);
  const containerHeightVh = n * 100;

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

        {/* Subtle dark vignette to help text legibility without obscuring the image */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20 pointer-events-none" />

        {/* Annotation markers */}
        {annotations.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white/40 text-base">No annotations added yet</p>
          </div>
        ) : (
          annotations.map((ann, i) => (
            <AnnotationMarker
              key={ann.id}
              annotation={ann}
              index={i}
              total={annotations.length}
              scrollYProgress={scrollYProgress}
            />
          ))
        )}
      </div>
    </div>
  );
}
