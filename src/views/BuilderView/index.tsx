import { useEffect, useRef, useState } from 'react';
import { useBuilderStore } from '../../store/builderStore';
import type { SaveStatus } from '../../store/builderStore';
import { useAuthStore } from '../../store/authStore';
import { BlockList } from '../../components/builder/BlockList';
import { AddBlockMenu } from '../../components/builder/AddBlockMenu';
import { StylePanel } from '../../components/builder/StylePanel';
import { HelpModal } from '../../components/ui/HelpModal';
import { cn } from '../../utils/cn';

type Device = 'mobile' | 'tablet' | 'desktop';

const DEVICES: { id: Device; label: string; width: number | null }[] = [
  { id: 'mobile',  label: 'Mobil',   width: 390  },
  { id: 'tablet',  label: 'iPad',    width: 768  },
  { id: 'desktop', label: 'Desktop', width: null },
];

export function BuilderView() {
  const { article, setTitle, darkMode, toggleDarkMode, loadProject, saveProject, saveStatus, undo, redo, history, future } =
    useBuilderStore();
  const { guestMode, exitGuestMode } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const [device, setDevice] = useState<Device>('mobile');
  const [helpOpen, setHelpOpen] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const selectedBlock = article.blocks.find((b) => b.id === selectedBlockId) ?? null;

  const projectId = new URLSearchParams(
    window.location.hash.replace(/^#\/edit\??/, '')
  ).get('id');

  useEffect(() => {
    if (projectId) loadProject(projectId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === 's') { e.preventDefault(); if (projectId && !guestMode) saveProject(); }
      if (mod && !e.shiftKey && e.key === 'z') { e.preventDefault(); undo(); }
      if ((mod && e.shiftKey && e.key === 'z') || (e.ctrlKey && e.key === 'y')) { e.preventDefault(); redo(); }
      if (e.key === 'Escape') setSelectedBlockId(null);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, guestMode, undo, redo]);

  const channelRef = useRef<BroadcastChannel | null>(null);
  useEffect(() => {
    channelRef.current = new BroadcastChannel('gp-storylab-preview');
    return () => channelRef.current?.close();
  }, []);

  useEffect(() => {
    const id = setTimeout(() => channelRef.current?.postMessage({ type: 'update', article, projectId }), 150);
    return () => clearTimeout(id);
  }, [article, projectId]);

  useEffect(() => {
    const id = setTimeout(() => channelRef.current?.postMessage({ type: 'update', article, projectId }), 100);
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device]);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!projectId || guestMode) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveProject(), 1000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article, guestMode]);

  function handleBack() {
    if (guestMode) { exitGuestMode(); window.location.hash = '#/auth'; }
    else window.location.hash = '#/';
  }

  const base = window.location.origin + window.location.pathname;
  const block = article.blocks[0];
  const isScrolly = block?.type === 'scrollymedia';

  // Preview src: scrollymedia blocks use the scrolly view; others use the render view
  const previewSrc = isScrolly
    ? (projectId ? `${base}#/scrolly?id=${projectId}&preview=1` : `${base}#/scrolly?preview=1`)
    : (projectId ? `${base}#/render?id=${projectId}&preview=1` : `${base}#/render?preview=1`);

  // Embed code
  const embedSrc = projectId
    ? (isScrolly ? `${base}#/scrolly?id=${projectId}` : `${base}#/render?id=${projectId}`)
    : '';

  let embedCode = '';
  if (embedSrc && isScrolly && block?.type === 'scrollymedia') {
    const n = block.slides.length;
    const wId = `sl-w-${projectId}`;
    const fId = `sl-f-${projectId}`;
    embedCode =
      `<div id="${wId}" style="height:${n * 100}vh;position:relative;width:100vw;margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw);">\n` +
      `  <iframe id="${fId}" src="${embedSrc}" style="position:sticky;top:0;height:100vh;width:100%;border:none;display:block;" allow="autoplay"></iframe>\n` +
      `</div>\n` +
      `<script>(function(){` +
      `var w=document.getElementById('${wId}'),f=document.getElementById('${fId}');` +
      `window.addEventListener('message',function(e){if(e.data&&e.data.type==='storylab-scrolly-init'&&e.source===f.contentWindow){w.style.height=e.data.scrollHeight+'px';}});` +
      `window.addEventListener('scroll',function(){if(!w||!f)return;var r=w.getBoundingClientRect(),h=window.innerHeight,sh=w.offsetHeight-h;if(sh<=0)return;var p=Math.max(0,Math.min(1,-r.top/sh));f.contentWindow.postMessage({type:'storylab-scroll',progress:p},'*');});` +
      `})();</script>`;
  } else if (embedSrc) {
    const iframeId = `sl-${projectId}`;
    embedCode =
      `<iframe id="${iframeId}" src="${embedSrc}" width="100%" frameborder="0" scrolling="no" allow="autoplay" style="border:none;display:block;width:100%;height:200px;overflow:hidden;"></iframe>\n` +
      `<script>(function(){var f=document.getElementById('${iframeId}');window.addEventListener('message',function(e){if(e.data&&e.data.type==='storylab-resize'&&f&&e.source===f.contentWindow){f.style.setProperty('height',e.data.height+'px','important');f.style.setProperty('overflow','hidden','important');}});})();</script>`;
  }

  function copyEmbedCode() {
    if (!embedCode) return;
    navigator.clipboard.writeText(embedCode).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  const blockCount = article.blocks.length;
  const activeDevice = DEVICES.find((d) => d.id === device)!;
  const canUndo = history.length > 0;
  const canRedo = future.length > 0;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-950">

      {/* ── Left: Editor panel ──────────────────────────────────── */}
      <div className="flex flex-col w-[380px] flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">

        <header className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 px-4 py-3 relative z-20">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <button onClick={handleBack} className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                ← {guestMode ? 'Logga in' : 'Tillbaka'}
              </button>
              <span className="text-sm font-bold tracking-tight text-gray-900 dark:text-gray-100">GP StoryLab</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={undo} disabled={!canUndo} title="Ångra (⌘Z)" aria-label="Ångra"
                className="w-7 h-7 flex items-center justify-center rounded text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M3 13A9 9 0 1 0 5.7 6.3"/></svg>
              </button>
              <button onClick={redo} disabled={!canRedo} title="Gör om (⌘⇧Z)" aria-label="Gör om"
                className="w-7 h-7 flex items-center justify-center rounded text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M21 13A9 9 0 1 1 18.3 6.3"/></svg>
              </button>
              <button onClick={toggleDarkMode} title={darkMode ? 'Växla till ljusläge' : 'Växla till mörkt läge'} aria-label="Växla mörkt läge"
                className="w-7 h-7 flex items-center justify-center rounded text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-0.5">
                {darkMode
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                  : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                }
              </button>
              <button
                onClick={() => setHelpOpen(true)}
                title="Hur man använder"
                className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xs font-bold transition-colors flex items-center justify-center"
              >
                ?
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

        <main className="flex-1 overflow-y-auto px-4 py-4">
          <BlockList selectedBlockId={selectedBlockId} onSelect={setSelectedBlockId} />
        </main>

        <footer className="flex-shrink-0 border-t border-gray-100 dark:border-gray-700 px-4 py-2.5 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
          <span>{blockCount} block</span>
          {guestMode ? (
            <span className="text-amber-500 dark:text-amber-400">Gästläge — sparas ej</span>
          ) : (
            <SaveIndicator status={saveStatus} updatedAt={article.updatedAt} />
          )}
        </footer>
      </div>

      {/* ── Middle: Preview panel ────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">

        <div className="flex-shrink-0 h-[41px] flex items-center justify-between px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            {DEVICES.map((d) => (
              <button key={d.id} onClick={() => setDevice(d.id)} title={d.label}
                className={cn('px-3 py-1 rounded-md text-xs font-medium transition-colors',
                  device === d.id
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300')}>
                {d.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {projectId && (
              <button onClick={copyEmbedCode} disabled={!embedCode}
                className="text-xs px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium transition-colors disabled:opacity-40">
                {copied ? 'Kopierat!' : 'Kopiera inbäddningskod'}
              </button>
            )}
            <a href={previewSrc} target="_blank" rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-md bg-gray-900 dark:bg-gray-100 hover:bg-gray-700 dark:hover:bg-gray-200 text-white dark:text-gray-900 font-medium transition-colors">
              Öppna ↗
            </a>
          </div>
        </div>

        <div className={cn('flex-1 min-h-0', device !== 'desktop' && 'overflow-auto bg-gray-100 dark:bg-gray-950 flex justify-center py-6')}>
          <iframe
            src={previewSrc}
            title="Förhandsgranskning av artikel"
            allow="autoplay"
            className="border-none"
            style={{
              backgroundColor: isScrolly ? '#000' : 'white',
              ...(device === 'desktop' ? { width: '100%', height: '100%', display: 'block' } : {
                width: activeDevice.width!,
                height: '100%',
                minHeight: '600px',
                borderRadius: '1rem',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 20px 60px -10px rgba(0,0,0,0.25)',
                flexShrink: 0,
              }),
            }}
          />
        </div>
      </div>

      {/* ── Right: Style panel ─────────────────────────────────── */}
      {selectedBlock && (
        <StylePanel block={selectedBlock} onClose={() => setSelectedBlockId(null)} />
      )}

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}

function SaveIndicator({ status, updatedAt }: { status: SaveStatus; updatedAt: string }) {
  if (status === 'saving') return <span>Sparar…</span>;
  if (status === 'error') return <span className="text-red-500 dark:text-red-400">Kunde inte spara</span>;
  if (status === 'saved') return <span className="text-green-600 dark:text-green-400">Sparad</span>;
  return <span>Sparad {new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>;
}
