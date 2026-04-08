import { useState } from 'react';
import type { BildspelBlock as BildspelBlockType } from '../../types';

interface Props { block: BildspelBlockType }

// If total images exceed this, thumbnails become a horizontal scroll row instead of a grid
const GRID_MAX = 7;

export function BildspelBlock({ block }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { images } = block;

  if (!images.length) return null;

  const safeIndex = Math.min(activeIndex, images.length - 1);
  const active = images[safeIndex];
  const useScrollRow = images.length > GRID_MAX;

  return (
    <div style={{ maxWidth: block.maxWidth ?? '100%', margin: '0 auto' }}>
      {/* ── Main image ── */}
      <div
        style={{ position: 'relative', width: '100%', height: block.styles?.slideHeight ?? '70vh', overflow: 'hidden', background: '#111' }}
      >
        <img
          key={active.id}
          src={active.src}
          alt={active.caption ?? ''}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: active.objectPosition ?? 'center center',
            display: 'block',
          }}
        />
        {active.caption && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
            padding: '1.5rem 1rem 0.75rem',
          }}>
            <p style={{ color: '#fff', fontSize: '0.875rem', margin: 0 }}>{active.caption}</p>
          </div>
        )}
      </div>

      {/* ── Thumbnails ── */}
      {images.length > 1 && (
        useScrollRow ? (
          // Horizontal scroll row for > 7 images
          <div style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto', padding: '0.25rem 0', WebkitOverflowScrolling: 'touch' }}>
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveIndex(i)}
                style={{
                  flexShrink: 0,
                  width: '3.5rem',
                  aspectRatio: '1',
                  overflow: 'hidden',
                  borderRadius: '0.25rem',
                  border: i === safeIndex ? '1px solid #111' : '1px solid transparent',
                  opacity: i === safeIndex ? 1 : 0.55,
                  cursor: 'pointer',
                  padding: 0,
                  background: 'none',
                  transition: 'opacity 0.15s, border-color 0.15s',
                }}
              >
                <img
                  src={img.src}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: img.objectPosition ?? 'center', display: 'block' }}
                />
              </button>
            ))}
          </div>
        ) : (
          // 3-column grid for ≤ 7 images
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.25rem', marginTop: '0.25rem' }}>
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveIndex(i)}
                style={{
                  aspectRatio: '1',
                  overflow: 'hidden',
                  borderRadius: '0.25rem',
                  border: i === safeIndex ? '1px solid #111' : '1px solid transparent',
                  opacity: i === safeIndex ? 1 : 0.55,
                  cursor: 'pointer',
                  padding: 0,
                  background: 'none',
                  transition: 'opacity 0.15s, border-color 0.15s',
                }}
              >
                <img
                  src={img.src}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: img.objectPosition ?? 'center', display: 'block' }}
                />
              </button>
            ))}
          </div>
        )
      )}
    </div>
  );
}
