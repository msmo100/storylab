import { useEffect, useRef, useState } from 'react';
import { useBuilderStore } from '../../store/builderStore';
import type { SaveStatus } from '../../store/builderStore';
import { BlockList } from '../../components/builder/BlockList';
import { AddBlockMenu } from '../../components/builder/AddBlockMenu';
import { cn } from '../../utils/cn';

type Device = 'mobile' | 'tablet' | 'desktop';

const DEVICES: { id: Device; label: string; width: number | null; icon: string }[] = [
  { id: 'mobile',  label: 'Mobil',   width: 390,  icon: '▯' },
  { id: 'tablet',  label: 'iPad',    width: 768,  icon: '▭' },
  { id: 'desktop', label: 'Desktop', width: null, icon: '▬' },
];

export function BuilderView() {
  const { article, setTitle, darkMode, toggleDarkMode, loadProject, saveProject, saveStatus } =
    useBuilderStore();
  const [copied, setCopied] = useState(false);
  const [device, setDevice] = useState<Device>('mobile');

  // Read projectId from hash: #/edit?id=<id>
  const projectId = new URLSearchParams(
    window.location.hash.replace(/^#\/edit\??/, '')
  ).get('id');

  // Load the project on mount
  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // BroadcastChannel pushes live article updates into the preview iframe (unchanged)
  const channelRef = useRef<BroadcastChannel | null>(null);
  useEffect(() => {
    channelRef.current = new BroadcastChannel('gp-storylab-preview');
    return () => channelRef.current?.close();
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      channelRef.current?.postMessage({ type: 'update', article });
    }, 150);
    return () => clearTimeout(id);
  }, [article]);

  // Debounced auto-save to Supabase
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!projectId) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveProject();
    }, 1000);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article]);

  const previewSrc = window.location.origin + window.location.pathname + '#/render';
  const embedCode = `<iframe src="${previewSrc}" width="100%" height="800" frameborder="0" allow="autoplay" style="border:none;display:block;"></iframe>`;

  function copyEmbedCode() {
    navigator.clipboard.writeText(embedCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const blockCount = article.blocks.length;
  const activeDevice = DEVICES.find((d) => d.id === device)!;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-950">

      {/* ── Left: Editor panel ──────────────────────────────────── */}
      <div className="flex flex-col w-[380px] flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">

        {/* Header */}
        <header className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 px-4 py-3 relative z-20">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <a
                href="#/"
                className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                ← Tillbaka
              </a>
              <span className="text-sm font-bold tracking-tight text-gray-900 dark:text-gray-100">GP StoryLab</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                title={darkMode ? 'Växla till ljusläge' : 'Växla till mörkt läge'}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-base leading-none px-1"
                aria-label="Växla mörkt läge"
              >
                {darkMode ? '☀' : '☽'}
              </button>
              <AddBlockMenu />
            </div>
          </div>
          <input
            type="text"
            value={article.title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Artikeltitel…"
            aria-label="Artikeltitel"
            className="w-full text-sm font-medium text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 bg-transparent rounded px-1.5 py-0.5 -mx-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800 focus:outline-none transition-colors"
          />
        </header>

        {/* Block list */}
        <main className="flex-1 overflow-y-auto px-4 py-4">
          <BlockList />
        </main>

        {/* Footer */}
        <footer className="flex-shrink-0 border-t border-gray-100 dark:border-gray-700 px-4 py-2.5 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
          <span>{blockCount} block</span>
          <SaveIndicator status={saveStatus} updatedAt={article.updatedAt} />
        </footer>
      </div>

      {/* ── Right: Preview panel ─────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Preview toolbar */}
        <div className="flex-shrink-0 h-[41px] flex items-center justify-between px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">

          {/* Device switcher */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            {DEVICES.map((d) => (
              <button
                key={d.id}
                onClick={() => setDevice(d.id)}
                title={d.label}
                className={cn(
                  'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                  device === d.id
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                )}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={copyEmbedCode}
              className="text-xs px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium transition-colors"
            >
              {copied ? 'Kopierat!' : 'Kopiera inbäddningskod'}
            </button>
            <a
              href={previewSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-md bg-gray-900 dark:bg-gray-100 hover:bg-gray-700 dark:hover:bg-gray-200 text-white dark:text-gray-900 font-medium transition-colors"
            >
              Öppna ↗
            </a>
          </div>
        </div>

        {/* Preview canvas */}
        {device === 'desktop' ? (
          <iframe
            src={previewSrc}
            className="flex-1 w-full border-none"
            title="Förhandsgranskning av artikel"
            allow="autoplay"
          />
        ) : (
          <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-950 flex justify-center py-6">
            <iframe
              src={previewSrc}
              title="Förhandsgranskning av artikel"
              allow="autoplay"
              style={{
                width: activeDevice.width!,
                height: '100%',
                minHeight: '600px',
                border: 'none',
                borderRadius: '1rem',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 20px 60px -10px rgba(0,0,0,0.25)',
                flexShrink: 0,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Save indicator ───────────────────────────────────────────────────────────

function SaveIndicator({ status, updatedAt }: { status: SaveStatus; updatedAt: string }) {
  if (status === 'saving') return <span>Sparar…</span>;
  if (status === 'error') return <span className="text-red-500 dark:text-red-400">Kunde inte spara</span>;
  if (status === 'saved') return <span className="text-green-600 dark:text-green-400">Sparad</span>;
  return (
    <span>
      Sparad {new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </span>
  );
}
