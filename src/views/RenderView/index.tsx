import { useEffect, useRef, useState } from 'react';
import { useBuilderStore } from '../../store/builderStore';
import { getProject } from '../../services/projectService';
import type { Article } from '../../types';
import { AnimatedBlock } from '../../components/blocks/AnimatedBlock';

// ─── URL params ───────────────────────────────────────────────────────────────

function getHashParams() {
  const params = new URLSearchParams(
    window.location.hash.replace(/^#\/render\??/, '')
  );
  return {
    id: params.get('id'),
    preview: params.get('preview') === '1',
  };
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function RenderView() {
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

  // Live updates via BroadcastChannel (builder preview)
  const [liveArticle, setLiveArticle] = useState<Article | null>(null);
  useEffect(() => {
    const channel = new BroadcastChannel('gp-storylab-preview');
    channel.onmessage = (e) => {
      if (e.data?.type === 'update' && e.data.article && e.data.projectId === projectId) setLiveArticle(e.data.article);
    };
    return () => channel.close();
  }, [projectId]);

  const isEmbedded = !isPreview && window !== window.parent;

  const article = liveArticle ?? fetchedArticle ?? (projectId ? null : storeArticle);

  // Report height to parent for iframe resize
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isEmbedded) return;
    // Suppress internal scrollbar
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    function send() {
      const h = document.documentElement.scrollHeight || document.body.scrollHeight;
      if (h) window.parent.postMessage({ type: 'storylab-resize', height: h }, '*');
    }
    const observer = new ResizeObserver(send);
    observer.observe(document.body);
    send(); // fire immediately on mount
    return () => observer.disconnect();
  }, [isEmbedded]);

  if (!article && !fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <span className="text-sm text-gray-400">Laddar…</span>
      </div>
    );
  }

  if (!article || article.blocks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <span className="text-sm text-gray-400">Inget innehåll.</span>
      </div>
    );
  }

  return (
    <div ref={contentRef} className={isEmbedded ? 'bg-white' : 'bg-white min-h-screen'}>
      {article.blocks.map((block) => (
        <AnimatedBlock key={block.id} block={block} />
      ))}
    </div>
  );
}
