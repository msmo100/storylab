import { useRef, useState } from 'react';
import type { CarouselBlock as CarouselBlockType } from '../../types';

interface Props { block: CarouselBlockType }

export function CarouselBlock({ block }: Props) {
  const { items } = block;
  const [current, setCurrent] = useState(0);
  const startX = useRef(0);

  if (items.length === 0) return null;

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - startX.current;
    if (dx < -40) setCurrent((c) => Math.min(c + 1, items.length - 1));
    if (dx > 40)  setCurrent((c) => Math.max(c - 1, 0));
  }

  return (
    <div
      style={{ maxWidth: block.maxWidth ?? '100%', margin: '0 auto' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-300"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {items.map((item) => (
            <div key={item.id} className="w-full flex-shrink-0">
              {item.src.match(/\.(mp4|webm|mov)$/i) ? (
                <video
                  src={item.src}
                  poster={item.poster}
                  autoPlay muted loop playsInline
                  className="w-full h-auto block"
                  style={{ maxHeight: '80vh', objectFit: 'cover' }}
                />
              ) : (
                <img src={item.src} alt={item.caption ?? ''} className="w-full h-auto block" />
              )}
              {item.caption && (
                <p
                  className="text-center text-sm text-gray-500 dark:text-gray-400 py-2"
                  style={{ fontFamily: block.styles?.fontFamily, fontSize: block.styles?.fontSize ? `${block.styles.fontSize}px` : undefined }}
                >{item.caption}</p>
              )}
            </div>
          ))}
        </div>
      </div>
      {items.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === current ? 'bg-gray-700 dark:bg-gray-300' : 'bg-gray-300 dark:bg-gray-600'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
