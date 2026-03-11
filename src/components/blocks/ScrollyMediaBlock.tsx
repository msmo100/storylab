import type { ScrollyMediaBlock as ScrollyMediaBlockType } from '../../types';

interface Props { block: ScrollyMediaBlockType }

/** Static preview shown inside the RenderView article flow.
 *  The real scrollytelling experience lives at #/scrolly and is embedded separately. */
export function ScrollyMediaBlock({ block }: Props) {
  const first = block.slides[0];
  return (
    <div
      style={{
        position: 'relative',
        height: '60vh',
        overflow: 'hidden',
        background: '#111',
        maxWidth: block.maxWidth ?? '100%',
        margin: '0 auto',
      }}
    >
      {first?.backgroundSrc && (
        first.backgroundType === 'video' ? (
          <video
            src={first.backgroundSrc}
            poster={first.backgroundPoster}
            autoPlay muted loop playsInline
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <img
            src={first.backgroundSrc}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', textAlign: 'center', padding: '2rem', gap: '0.5rem' }}>
        <p style={{ fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>ScrollyMedia</p>
        <p style={{ fontSize: '1rem', opacity: 0.8 }}>{block.slides.length} sektioner · Bäddas in separat</p>
      </div>
    </div>
  );
}
