import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { useBuilderStore } from '../../store/builderStore';
import { getProject } from '../../services/projectService';
import type { Article, ScrollyMediaBlock, ScrollySlide } from '../../types';

// ─── URL params ───────────────────────────────────────────────────────────────

function getHashParams() {
  const params = new URLSearchParams(
    window.location.hash.replace(/^#\/scrolly\??/, '')
  );
  return {
    id: params.get('id'),
    preview: params.get('preview') === '1',
  };
}

// ─── Root view ────────────────────────────────────────────────────────────────

export function ScrollyView() {
  const { id: projectId, preview: isPreview } = getHashParams();
  const storeArticle = useBuilderStore((state) => state.article);

  const [fetchedArticle, setFetchedArticle] = useState<Article | null>(null);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    getProject(projectId).then(({ data, error }) => {
      if (error || !data) setFetchError(true);
      else setFetchedArticle(data);
    });
  }, [projectId]);

  // Live updates from the builder via BroadcastChannel
  const [liveArticle, setLiveArticle] = useState<Article | null>(null);
  useEffect(() => {
    const channel = new BroadcastChannel('gp-storylab-preview');
    channel.onmessage = (e) => {
      if (e.data?.type === 'update' && e.data.article && e.data.projectId === projectId) setLiveArticle(e.data.article);
    };
    return () => channel.close();
  }, []);

  // isEmbedded = running inside a real CMS iframe (not builder's own preview)
  const isEmbedded = !isPreview && window !== window.parent;

  // Kill scrollbars when embedded
  useEffect(() => {
    if (!isEmbedded) return;
    const style = document.createElement('style');
    style.textContent =
      'html,body{overflow:hidden;scrollbar-width:none}' +
      'html::-webkit-scrollbar,body::-webkit-scrollbar{display:none}';
    document.head.appendChild(style);
    return () => style.remove();
  }, [isEmbedded]);

  const article = liveArticle ?? fetchedArticle ?? (projectId ? null : storeArticle);
  const scrollyBlock = article?.blocks.find((b): b is ScrollyMediaBlock => b.type === 'scrollymedia');
  const slides = scrollyBlock?.slides ?? [];

  // Tell the parent iframe wrapper how tall to make itself
  useEffect(() => {
    if (!isEmbedded || !slides.length) return;
    const scrollHeight = Math.max(slides.length, 1) * window.innerHeight;
    window.parent.postMessage({ type: 'storylab-scrolly-init', scrollHeight }, '*');
  }, [isEmbedded, slides.length]);

  if (!article && !fetchError) {
    return <Shell><span style={{ color: '#555', fontSize: '0.875rem' }}>Laddar…</span></Shell>;
  }

  if (!article || slides.length === 0) {
    return <Shell><span style={{ color: '#555', fontSize: '0.875rem' }}>Inga sektioner tillagda.</span></Shell>;
  }

  return <ScrollyContent slides={slides} isEmbedded={isEmbedded} />;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
      {children}
    </div>
  );
}

// ─── Main content ─────────────────────────────────────────────────────────────

function ScrollyContent({
  slides,
  isEmbedded,
}: {
  slides: ScrollySlide[];
  isEmbedded: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollYProgress = useMotionValue(0);

  const { scrollYProgress: nativeProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    if (isEmbedded) return;
    return nativeProgress.on('change', (v) => scrollYProgress.set(v));
  }, [isEmbedded, nativeProgress, scrollYProgress]);

  useEffect(() => {
    if (!isEmbedded) return;
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'storylab-scroll') {
        scrollYProgress.set(e.data.progress as number);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [isEmbedded, scrollYProgress]);

  const slideElements = (
    <>
      {slides.map((slide, i) => (
        <Slide
          key={slide.id}
          slide={slide}
          index={i}
          total={slides.length}
          scrollYProgress={scrollYProgress}
        />
      ))}
    </>
  );

  if (isEmbedded) {
    return (
      <div style={{ height: '100vh', overflow: 'hidden', position: 'relative', background: '#000' }}>
        {slideElements}
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ height: `${slides.length * 100}vh` }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', background: '#000' }}>
        {slideElements}
      </div>
    </div>
  );
}

// ─── Individual slide ─────────────────────────────────────────────────────────

function Slide({
  slide,
  index,
  total,
  scrollYProgress,
}: {
  slide: ScrollySlide;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  const isFirst = index === 0;

  const slotStart = index / total;
  const slotEnd = (index + 1) / total;
  const localProgress = useTransform(scrollYProgress, [slotStart, slotEnd], [0, 1]);

  const opacity = useTransform(localProgress, [0, 0.35], [isFirst ? 1 : 0, 1]);
  const bgY = '0%';

  const headlineY = useTransform(localProgress, [0, 1], [isFirst ? '0px' : '60vh', '-60vh']);
  const headlineOpacity = useTransform(localProgress, [0, 0.18], [isFirst ? 1 : 0, 1]);

  const subY = useTransform(localProgress, [0, 1], [isFirst ? '0px' : '65vh', '-65vh']);
  const subOpacity = useTransform(localProgress, [0.05, 0.23], [isFirst ? 1 : 0, 1]);

  const bodyY = useTransform(localProgress, [0, 1], [isFirst ? '0px' : '70vh', '-70vh']);
  const bodyOpacity = useTransform(localProgress, [0.10, 0.28], [isFirst ? 1 : 0, 1]);

  const overlayOpacity = slide.overlayOpacity ?? 0.5;

  return (
    <motion.div className="absolute inset-0" style={{ opacity, zIndex: index }}>
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        {slide.backgroundType === 'video' ? (
          <video
            src={slide.backgroundSrc}
            poster={slide.backgroundPoster}
            autoPlay muted loop playsInline
            className="absolute inset-0 w-full object-cover"
            style={{ height: '100%', top: '0' }}
          />
        ) : (
          <img
            src={slide.backgroundSrc || 'https://placehold.co/1920x1080/111827/111827'}
            alt=""
            className="absolute inset-0 w-full object-cover"
            style={{ height: '100%', top: '0' }}
          />
        )}
      </motion.div>

      <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />

      <div className="absolute inset-0 flex items-center justify-center px-8">
        <div className="text-center max-w-3xl w-full">
          {slide.headline && (
            <motion.h2
              style={{ opacity: headlineOpacity, y: headlineY, fontSize: 'clamp(1.75rem, 5vw, 3.5rem)' }}
              className="text-white font-bold leading-tight drop-shadow-lg"
            >
              {slide.headline}
            </motion.h2>
          )}
          {slide.subheadline && (
            <motion.p
              style={{ opacity: subOpacity, y: subY, fontSize: 'clamp(1rem, 2.5vw, 1.375rem)' }}
              className="text-white/80 font-medium drop-shadow mt-4"
            >
              {slide.subheadline}
            </motion.p>
          )}
          {slide.body && (
            <motion.p
              style={{ opacity: bodyOpacity, y: bodyY, fontSize: 'clamp(0.9rem, 2vw, 1.125rem)' }}
              className="text-white/65 leading-relaxed drop-shadow mt-6 max-w-xl mx-auto"
            >
              {slide.body}
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

