import { useEffect, useState, type CSSProperties } from 'react';
import { useBuilderStore } from '../../store/builderStore';
import { AnimatedBlock } from '../../components/blocks/AnimatedBlock';
import type { Article, Block } from '../../types';

export function RenderView() {
  const storeArticle = useBuilderStore((state) => state.article);

  // Live updates pushed from the builder via BroadcastChannel
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

  // Prefer live article (from builder) over the last-persisted store value
  const article = liveArticle ?? storeArticle;

  // Detect whether we're running inside a CMS iframe
  const isEmbedded = window !== window.parent;

  // Hide the native scrollbar when rendered inside the builder preview iframe
  useEffect(() => {
    if (!isEmbedded) return;
    const style = document.createElement('style');
    style.textContent = 'html{scrollbar-width:none}html::-webkit-scrollbar{display:none}';
    document.head.appendChild(style);
    return () => style.remove();
  }, [isEmbedded]);

  const firstBlock = article.blocks[0];
  const startsWithHero = firstBlock?.type === 'hero';

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Article title — only shown when a title is set and the first block isn't a hero */}
      {!startsWithHero && article.title.trim() && (
        <header className="mx-auto max-w-2xl px-6 py-16 text-center">
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            {article.title}
          </h1>
        </header>
      )}

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

  if (block.type === 'image' || block.type === 'video' || block.type === 'carousel') {
    return (
      <div className="my-12" style={sizeStyle}>
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
