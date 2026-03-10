import { useEffect, useState, useRef, type CSSProperties } from 'react';
import { useBuilderStore } from '../../store/builderStore';
import { getProject } from '../../services/projectService';
import { AnimatedBlock } from '../../components/blocks/AnimatedBlock';
import type { Article, Block } from '../../types';

function getRenderId(): string | null {
  return new URLSearchParams(
    window.location.hash.replace(/^#\/render\??/, '')
  ).get('id');
}

export function RenderView() {
  const storeArticle = useBuilderStore((state) => state.article);
  const renderId = getRenderId();

  // Article fetched from DB when a render ID is present in the URL
  const [fetchedArticle, setFetchedArticle] = useState<Article | null>(null);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!renderId) return;
    getProject(renderId).then(({ data, error }) => {
      if (error || !data) setFetchError(true);
      else setFetchedArticle(data);
    });
  }, [renderId]);

  // Live updates pushed from the builder via BroadcastChannel (used for the
  // builder's own preview iframe — overrides the fetched/store article)
  const [liveArticle, setLiveArticle] = useState<Article | null>(null);
  useEffect(() => {
    const channel = new BroadcastChannel('gp-storylab-preview');
    channel.onmessage = (e) => {
      if (e.data?.type === 'update' && e.data.article) {
        setLiveArticle(e.data.article);
      }
    };
    return () => channel.close();
  }, []);

  // Detect whether we're running inside a CMS iframe
  const isEmbedded = window !== window.parent;

  // Hide scrollbars and clip horizontal overflow when inside an iframe so that
  // the carousel's wide flex layout doesn't inflate height measurements
  useEffect(() => {
    if (!isEmbedded) return;
    const style = document.createElement('style');
    style.textContent = 'html,body{scrollbar-width:none;overflow-x:hidden}html::-webkit-scrollbar{display:none}';
    document.head.appendChild(style);
    return () => style.remove();
  }, [isEmbedded]);

  const contentRef = useRef<HTMLDivElement>(null);

  // Post content height to parent so the iframe can auto-resize
  useEffect(() => {
    if (!isEmbedded) return;
    const sendHeight = () => {
      const height = contentRef.current
        ? contentRef.current.scrollHeight
        : document.body.scrollHeight;
      window.parent.postMessage({ type: 'storylab-resize', height }, '*');
    };
    const observer = new ResizeObserver(sendHeight);
    const target = contentRef.current ?? document.body;
    observer.observe(target);
    sendHeight();
    return () => observer.disconnect();
  }, [isEmbedded]);

  // Priority: live (builder preview) > fetched (DB) > store (fallback)
  const article = liveArticle ?? fetchedArticle ?? (renderId ? null : storeArticle);

  // Still waiting for fetch or first BroadcastChannel message
  if (!article && !fetchError) {
    return (
      <div className="flex items-center justify-center bg-white" style={{ height: '4rem' }}>
        <span className="text-sm text-gray-400">Laddar…</span>
      </div>
    );
  }

  // Fetch failed and nothing else provided an article (e.g. no BroadcastChannel)
  if (!article) {
    return (
      <div className="flex items-center justify-center bg-white" style={{ height: '4rem' }}>
        <span className="text-sm text-gray-400">Artikeln hittades inte.</span>
      </div>
    );
  }

  return (
    <div ref={contentRef} className={`bg-white text-gray-900${isEmbedded ? '' : ' min-h-screen'}`}>
      {/* Block feed */}
      <main>
        {article.blocks.length === 0 ? (
          <div className="mx-auto max-w-2xl px-6 py-24 text-center text-gray-400">
            <p className="text-lg">Inget innehåll ännu.</p>
          </div>
        ) : (
          article.blocks.map((block) => <BlockWrapper key={block.id} block={block} />)
        )}
      </main>

      {/* Edit button — only shown when opened as a standalone tab, not inside a CMS iframe */}
      {!isEmbedded && (
        <a
          href="#/"
          className="fixed bottom-5 right-5 z-50 rounded-full bg-gray-900/80 px-4 py-2 text-xs font-medium text-white opacity-50 backdrop-blur hover:opacity-100 transition-opacity"
        >
          ← Redigera
        </a>
      )}
    </div>
  );
}

function BlockWrapper({ block }: { block: Block }) {
  const sizeStyle: CSSProperties = block.maxWidth
    ? { maxWidth: block.maxWidth, marginLeft: 'auto', marginRight: 'auto' }
    : {};

  if (
    block.type === 'hero' ||
    block.type === 'sticky' ||
    block.type === 'scrollmedia'
  ) {
    if (block.maxWidth) {
      return <div style={sizeStyle}><AnimatedBlock block={block} /></div>;
    }
    return <AnimatedBlock block={block} />;
  }

  if (block.type === 'image' || block.type === 'video') {
    return (
      <div className="my-12" style={sizeStyle}>
        <AnimatedBlock block={block} />
      </div>
    );
  }

  if (block.type === 'carousel') {
    return (
      <div className="mt-6" style={sizeStyle}>
        <AnimatedBlock block={block} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-6" style={sizeStyle}>
      <AnimatedBlock block={block} />
    </div>
  );
}
