import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import type { ScrollMediaBlock as ScrollMediaBlockType } from '../../types';
import { cn } from '../../utils/cn';

interface Props {
  block: ScrollMediaBlockType;
}

const PLACEHOLDER = 'https://placehold.co/1920x1080/111827/111827';

export function ScrollMediaBlock({ block }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasEntered, setHasEntered] = useState(false);

  // Detect viewport entry / exit to autoplay the active video
  const { ref: stickyRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.1,
    triggerOnce: false,
  });

  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (isIntersecting && i === activeIndex) video.play().catch(() => {});
      else video.pause();
    });
  }, [isIntersecting, activeIndex]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const { text, textPosition, textEntrance, mediaType, images } = block;
  const n = images.length;

  // Per-image scroll durations (in viewport-height units, default 1 each).
  // totalVh = sum of all image slots + 1 extra vh for a smooth sticky exit.
  const scrollVhs = images.map((img) => img.scrollVh ?? 1);
  const sumVh = scrollVhs.reduce((a, b) => a + b, 0);
  const totalVh = sumVh + 1;

  // Transition boundaries as fractions of scrollYProgress [0..1].
  // boundaries[i] = progress value at which image i becomes active.
  const boundaries: number[] = [0];
  let cumulativeVh = 0;
  for (const vh of scrollVhs) {
    cumulativeVh += vh;
    boundaries.push(cumulativeVh / totalVh);
  }

  // Safe fallbacks used by useTransform before the n ≤ 1 early return.
  const b1 = n >= 2 ? boundaries[1] : 0.33;
  const b2 = n >= 2 ? (boundaries[2] ?? boundaries[1]) : 0.67;

  // For n ≤ 1 the entrance fires when the section enters the viewport.
  // For n ≥ 2 it fires the moment scrollYProgress crosses 0 (sticky phase
  // begins), ensuring the text is fully in view when the animation plays.
  useEffect(() => {
    if (n <= 1 && isIntersecting) setHasEntered(true);
  }, [isIntersecting, n]);

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    if (n >= 2 && p > 0) setHasEntered(true);
    if (n < 2) return;
    // Find which image's slot we're in using the variable boundaries.
    let idx = n - 1;
    for (let i = 0; i < n; i++) {
      if (p < boundaries[i + 1]) { idx = i; break; }
    }
    setActiveIndex(idx);
  });

  // Text slides from center to bottom:
  //   - Stays put during image 0's slot        (0 → b1)
  //   - Slides to 28 vh during image 1's slot  (b1 → b2)
  //   - Stays at bottom for any remaining images
  // For n ≤ 1 this value is computed but unused (early return below).
  const textY = useTransform(
    scrollYProgress,
    [0, b1, b2],
    ['0vh', '0vh', '28vh'],
  );

  // Entrance animation initial / animate values
  const entranceHidden =
    textEntrance === 'fade'       ? { opacity: 0, x: 0 } :
    textEntrance === 'from-left'  ? { opacity: 0, x: -32 } :
    textEntrance === 'from-right' ? { opacity: 0, x: 32 } :
                                    { opacity: 1, x: 0 };
  const entranceVisible = { opacity: 1, x: 0 };

  // ── Shared text overlay ─────────────────────────────────────────────────────
  const textOverlay = (
    <div
      className={cn(
        'absolute inset-0 z-10 flex flex-col justify-center px-8 md:px-20 pointer-events-none',
        textPosition === 'right' && 'items-end',
        textPosition === 'center' && 'items-center',
        textPosition === 'left' && 'items-start',
      )}
    >
      {/* Outer div: scroll-linked vertical position */}
      <motion.div
        className={cn(
          'max-w-xl',
          textPosition === 'right' && 'text-right',
          textPosition === 'center' && 'text-center',
          textPosition === 'left' && 'text-left',
        )}
        style={{ y: textY }}
      >
        {/* Inner div: one-shot entrance animation */}
        <motion.div
          initial={entranceHidden}
          animate={hasEntered ? entranceVisible : entranceHidden}
          transition={{ duration: 0.55, ease: [0.25, 0, 0.25, 1] }}
        >
          {text ? (
            <p
              className="text-white text-2xl md:text-4xl font-semibold leading-snug drop-shadow-lg"
              style={{
                color: block.styles?.textColor,
                fontFamily: block.styles?.fontFamily,
              }}
            >
              {text}
            </p>
          ) : (
            <p className="text-white/40 text-base italic">Ingen text tillagd</p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );

  // ── 0 or 1 image: static full-screen section ────────────────────────────────
  if (n <= 1) {
    const img = images[0];
    return (
      <div ref={stickyRef} className="relative h-screen overflow-hidden">
        {img ? (
          mediaType === 'video' ? (
            <video
              ref={(el) => { videoRefs.current[0] = el; }}
              src={img.src}
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <img
              src={img.src || PLACEHOLDER}
              alt={img.alt || ''}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )
        ) : (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            <p className="text-white/40 text-base">Inga bilder tillagda</p>
          </div>
        )}
        <div className="absolute inset-0 bg-black/45 z-[1] pointer-events-none" />
        {textOverlay}
      </div>
    );
  }

  // ── 2+ images: sticky scroll with crossfade ─────────────────────────────────
  return (
    <div ref={containerRef} style={{ height: `${totalVh * 100}vh` }}>
      <div ref={stickyRef} className="sticky top-0 h-screen overflow-hidden">
        {/* Images stacked — crossfade as activeIndex changes */}
        <div className="absolute inset-0">
          {images.map((img, i) => (
            <motion.div
              key={img.id}
              className="absolute inset-0"
              initial={{ opacity: i === 0 ? 1 : 0 }}
              animate={{ opacity: i === activeIndex ? 1 : 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              {mediaType === 'video' ? (
                <video
                  ref={(el) => { videoRefs.current[i] = el; }}
                  src={img.src}
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={img.src || PLACEHOLDER}
                  alt={img.alt || ''}
                  className="w-full h-full object-cover"
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Scrim keeps text legible over any image */}
        <div className="absolute inset-0 bg-black/45 z-[1] pointer-events-none" />
        {textOverlay}
      </div>
    </div>
  );
}
