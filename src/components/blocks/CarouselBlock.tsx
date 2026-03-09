import { useRef, useState, useEffect } from 'react';
import type { CarouselBlock as CarouselBlockType } from '../../types';

interface Props {
  block: CarouselBlockType;
}

export function CarouselBlock({ block }: Props) {
  const { items } = block;
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  function getClosestIndex(): number {
    const track = trackRef.current;
    if (!track || track.children.length === 0) return 0;
    const viewCentre = track.scrollLeft + track.offsetWidth / 2;
    let closest = 0;
    let minDist = Infinity;
    for (let i = 0; i < track.children.length; i++) {
      const child = track.children[i] as HTMLElement;
      const childCentre = child.offsetLeft + child.offsetWidth / 2;
      const dist = Math.abs(viewCentre - childCentre);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    }
    return closest;
  }

  // Play native video at index, pause others
  function syncVideos(index: number) {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === index) v.play().catch(() => {});
      else v.pause();
    });
  }

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    function onScrollEnd() {
      if (fallbackTimer) { clearTimeout(fallbackTimer); fallbackTimer = null; }
      const index = getClosestIndex();
      activeIndexRef.current = index;
      setActiveIndex(index);
      syncVideos(index);
    }

    function onScroll() {
      const index = getClosestIndex();
      if (index !== activeIndexRef.current) {
        activeIndexRef.current = index;
        setActiveIndex(index);
      }
      if (fallbackTimer) clearTimeout(fallbackTimer);
      fallbackTimer = setTimeout(onScrollEnd, 150);
    }

    track.addEventListener('scroll', onScroll, { passive: true });
    track.addEventListener('scrollend', onScrollEnd);
    return () => {
      track.removeEventListener('scroll', onScroll);
      track.removeEventListener('scrollend', onScrollEnd);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  function scrollTo(index: number) {
    const track = trackRef.current;
    if (!track) return;
    const child = track.children[index] as HTMLElement;
    child?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-400 text-sm">
        Inga videor tillagda
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        {/* Video track — 84% wide items create peek on both sides */}
        <div
          ref={trackRef}
          className="flex overflow-x-scroll snap-x snap-mandatory gap-3"
          style={{
            scrollbarWidth: 'none',
            paddingLeft: '8%',
            paddingRight: '8%',
            scrollPaddingLeft: '8%',
          }}
        >
          {items.map((item, i) => (
              <div
                key={item.id}
                className="flex-shrink-0 snap-start"
                style={{ width: '84%' }}
              >
                <video
                  ref={(el) => { videoRefs.current[i] = el; }}
                  src={item.src}
                  poster={item.poster}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full block rounded-lg bg-black"
                />
                {item.caption && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1.5 px-1">
                    {item.caption}
                  </p>
                )}
              </div>
          ))}
        </div>

        {/* Prev / Next arrows */}
        {items.length > 1 && (
          <>
            <button
              onClick={() => scrollTo(Math.max(0, activeIndex - 1))}
              disabled={activeIndex === 0}
              aria-label="Föregående"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white text-xl flex items-center justify-center disabled:opacity-20 transition-opacity ml-1"
            >
              ‹
            </button>
            <button
              onClick={() => scrollTo(Math.min(items.length - 1, activeIndex + 1))}
              disabled={activeIndex === items.length - 1}
              aria-label="Nästa"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white text-xl flex items-center justify-center disabled:opacity-20 transition-opacity mr-1"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      {items.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {items.map((item, i) => (
            <button
              key={item.id}
              onClick={() => scrollTo(i)}
              aria-label={`Gå till video ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === activeIndex
                  ? 'w-5 bg-gray-800 dark:bg-gray-200'
                  : 'w-1.5 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
