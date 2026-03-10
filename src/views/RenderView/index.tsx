import { useEffect, useState, useRef, type CSSProperties } from 'react';
import { useBuilderStore } from '../../store/builderStore';
import { getProject } from '../../services/projectService';
import { AnimatedBlock } from '../../components/blocks/AnimatedBlock';
import type { Article, Block } from '../../types';

function getHashParams() {
  const params = new URLSearchParams(
    window.location.hash.replace(/^#\/render\??/, '')
  );
  return { id: params.get('id'), preview: params.get('preview') === '1' };
}

export function RenderView() {
  const storeArticle = useBuilderStore((state) => state.article);
  const { id: renderId, preview: isPreview } = getHashParams();

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

  // Detect whether we're running inside a real CMS iframe (not the builder's own preview)
  const isEmbedded = !isPreview && window !== window.parent;

  // When embedded: kill all scrollbars and prevent any overflow from leaking out
  useEffect(() => {
    if (!isEmbedded) return;
    const style = document.createElement('style');
    style.textContent =
      'html,body{overflow:hidden;scrollbar-width:none}' +
      'html::-webkit-scrollbar,body::-webkit-scrollbar{display:none}';
    document.head.appendChild(style);
    return () => style.remove();
  }, [isEmbedded]);

  // Priority: live (builder preview) > fetched (DB) > store (fallback)
  const article = liveArticle ?? fetchedArticle ?? (renderId ? null : storeArticle);

  const contentRef = useRef<HTMLDivElement>(null);

  // Post exact content height to parent so the CMS iframe can auto-resize
  useEffect(() => {
    if (!isEmbedded) return;
    const el = contentRef.current;
    if (!el) return;

    const post = () =>
      window.parent.postMessage(
        { type: 'storylab-resize', height: Math.ceil(el.getBoundingClientRect().height) },
        '*'
      );

    // Debounced version for ResizeObserver / resize events
    let timer: ReturnType<typeof setTimeout>;
    const sendHeight = () => {
      clearTimeout(timer);
      timer = setTimeout(post, 50);
    };

    const ro = new ResizeObserver(sendHeight);
    ro.observe(el);
    window.addEventListener('resize', sendHeight);

    // Fire immediately + safety shots for late-loading media
    post();
    const t1 = setTimeout(post, 200);
    const t2 = setTimeout(post, 1000);

    return () => {
      clearTimeout(timer);
      clearTimeout(t1);
      clearTimeout(t2);
      ro.disconnect();
      window.removeEventListener('resize', sendHeight);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEmbedded, article]);

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
    <div ref={contentRef} className={`text-gray-900${isEmbedded ? ' overflow-hidden' : ' bg-white min-h-screen'}`}>
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

      {/* Edit button — only shown when opened as a standalone tab, not inside the builder preview or a CMS iframe */}
      {!isEmbedded && !isPreview && (
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
      <div className="my-6" style={sizeStyle}>
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
