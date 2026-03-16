import { useEffect, useRef, useState } from 'react';
import type { CarouselBlock as CarouselBlockType } from '../../types';

interface Props { block: CarouselBlockType }

const GAP = 12; // px between slides

export function CarouselBlock({ block }: Props) {
  const { items } = block;
  const [current, setCurrent] = useState(0);
  const startX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    function measure() {
      if (!containerRef.current) return;
      setContainerW(containerRef.current.offsetWidth);
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Desktop (≥480px) with ≥3 items: show 3 slides, active in center
  // Mobile or <3 items: show 1 slide + 10% peek of next
  const isDesktop = containerW >= 480 && items.length >= 3;
  const slideW = containerW === 0 ? 0
    : isDesktop
      ? (containerW - 2 * GAP) / 3
      : containerW * 0.9;

  // Desktop: center the active slide, clamped so we never over-scroll
  // Mobile: simple left-offset
  const rawOffset = current * (slideW + GAP);
  const translateX = containerW === 0 ? 0
    : isDesktop
      ? -Math.max(0, Math.min((items.length - 3) * (slideW + GAP), rawOffset - (slideW + GAP)))
      : -rawOffset;

  // Play only the current slide's video; pause all others
  useEffect(() => {
    videoRefs.current.forEach((vid, i) => {
      if (!vid) return;
      if (i === current) vid.play().catch(() => {});
      else vid.pause();
    });
  }, [current]);

  if (items.length === 0) return null;

  function prev() { setCurrent((c) => Math.max(c - 1, 0)); }
  function next() { setCurrent((c) => Math.min(c + 1, items.length - 1)); }

  function onTouchStart(e: React.TouchEvent) { startX.current = e.touches[0].clientX; }
  function onTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - startX.current;
    if (dx < -40) next();
    if (dx > 40)  prev();
  }

  return (
    <div style={{ maxWidth: block.maxWidth ?? '100%', margin: '0 auto' }}>
      <div
        ref={containerRef}
        className="relative overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Track */}
        <div
          className="flex transition-transform duration-300"
          style={{ gap: `${GAP}px`, transform: `translateX(${translateX}px)` }}
        >
          {items.map((item, i) => (
            <div
              key={item.id}
              className="flex-shrink-0 transition-opacity duration-300"
              style={{
                width: slideW > 0 ? `${slideW}px` : isDesktop ? '33%' : '90%',
                opacity: isDesktop && i !== current ? 0.55 : 1,
              }}
            >
              {item.src.match(/\.(mp4|webm|mov)$/i) ? (
                <video
                  ref={(el) => { videoRefs.current[i] = el; }}
                  src={item.src}
                  poster={item.poster}
                  muted loop playsInline
                  className="w-full h-auto block"
                  style={{ borderRadius: block.styles?.borderRadius }}
                />
              ) : (
                <img
                  src={item.src}
                  alt={item.caption ?? ''}
                  className="w-full h-auto block"
                  style={{ borderRadius: block.styles?.borderRadius }}
                />
              )}
              {item.caption && (
                <p
                  className="text-center text-sm text-gray-500 py-2"
                  style={{
                    fontFamily: block.styles?.fontFamily,
                    fontWeight: block.styles?.fontWeight,
                    fontStyle: block.styles?.fontStyle,
                    fontSize: block.styles?.fontSize ? `${block.styles.fontSize}px` : undefined,
                  }}
                >
                  {item.caption}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Arrow buttons */}
        {items.length > 1 && (
          <>
            <button
              onClick={prev}
              disabled={current === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 disabled:opacity-20 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors z-10"
              aria-label="Föregående"
            >
              ‹
            </button>
            <button
              onClick={next}
              disabled={current === items.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 disabled:opacity-20 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors z-10"
              aria-label="Nästa"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      {items.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === current ? 'bg-gray-700' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
