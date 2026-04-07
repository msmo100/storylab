import { useState } from 'react';
import { useBuilderStore } from '../../store/builderStore';
import type {
  Block, VideoBlock, QuoteBlock,
  StickyBlock, TimelineBlock, TimelineEntry, TimelineDotStyle,
  ChatBlock, ChatMessage, CarouselBlock, CarouselItem,
  ScrollyMediaBlock, ScrollySlide,
} from '../../types';
import { AnimationSelect } from './AnimationSelect';
import { generateId } from '../../utils/generateId';
import { cn } from '../../utils/cn';

const INPUT = 'w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400';
const LABEL = 'block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1';
const SECTION = 'flex flex-col gap-3 pt-3';

interface Props { block: Block }

export function BlockEditor({ block }: Props) {
  const { updateBlock } = useBuilderStore();
  const upd = (updates: Partial<Block>) => updateBlock(block.id, updates);

  return (
    <div className="mt-3 border-t border-gray-100 dark:border-gray-700">
      {/* Animation (not for scrollymedia — it handles its own) */}
      {block.type !== 'scrollymedia' && (
        <div className={SECTION}>
          <div>
            <label className={LABEL}>Entré-animation</label>
            <AnimationSelect blockId={block.id} value={block.animation} />
          </div>
          <div>
            <label className={LABEL}>Animationsfördröjning (sek)</label>
            <input
              type="number" min={0} max={3} step={0.1}
              value={block.animationDelay ?? 0}
              onChange={(e) => upd({ animationDelay: parseFloat(e.target.value) })}
              className={INPUT}
            />
          </div>
        </div>
      )}

      {block.type === 'video' && <VideoEditor block={block} />}
      {block.type === 'quote' && <QuoteEditor block={block} />}
      {block.type === 'sticky' && <StickyEditor block={block} />}
      {block.type === 'timeline' && <TimelineEditor block={block} />}
      {block.type === 'chat' && <ChatEditor block={block} />}
      {block.type === 'carousel' && <CarouselEditor block={block} />}
      {block.type === 'scrollymedia' && <ScrollyMediaEditor block={block} />}
    </div>
  );
}

// ─── Video ────────────────────────────────────────────────────────────────────

function VideoEditor({ block }: { block: VideoBlock }) {
  const { updateBlock } = useBuilderStore();
  return (
    <div className={SECTION}>
      <div>
        <label className={LABEL}>Video-URL</label>
        <input type="url" value={block.src} onChange={(e) => updateBlock(block.id, { src: e.target.value })} placeholder="https://…/video.mp4" className={INPUT} />
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
        <input
          type="checkbox"
          checked={block.autoplay}
          onChange={(e) => updateBlock(block.id, { autoplay: e.target.checked })}
          className="rounded border-gray-300"
        />
        Spelas automatiskt i vyport
      </label>
    </div>
  );
}

// ─── Quote ────────────────────────────────────────────────────────────────────

function QuoteEditor({ block }: { block: QuoteBlock }) {
  const { updateBlock } = useBuilderStore();
  return (
    <div className={SECTION}>
      <div>
        <label className={LABEL}>Citat</label>
        <textarea rows={3} value={block.text} onChange={(e) => updateBlock(block.id, { text: e.target.value })} placeholder="Citattext…" className={cn(INPUT, 'resize-none')} />
      </div>
      <div>
        <label className={LABEL}>Källa (valfri)</label>
        <input type="text" value={block.attribution ?? ''} onChange={(e) => updateBlock(block.id, { attribution: e.target.value || undefined })} placeholder="Namn, titel…" className={INPUT} />
      </div>
    </div>
  );
}

// ─── Sticky ───────────────────────────────────────────────────────────────────

function StickyEditor({ block }: { block: StickyBlock }) {
  const { updateBlock } = useBuilderStore();
  const upd = (u: Partial<StickyBlock>) => updateBlock(block.id, u);
  return (
    <div className={SECTION}>
      <div>
        <label className={LABEL}>Bakgrundstyp</label>
        <div className="flex gap-2">
          {(['image', 'video'] as const).map((t) => (
            <button key={t} onClick={() => upd({ backgroundType: t })}
              className={cn('px-3 py-1 rounded-md text-xs font-medium border transition-colors',
                block.backgroundType === t
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-transparent'
                  : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400')}>
              {t === 'image' ? 'Bild' : 'Video'}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className={LABEL}>Bakgrunds-URL</label>
        <input type="url" value={block.backgroundSrc} onChange={(e) => upd({ backgroundSrc: e.target.value })} placeholder="https://…" className={INPUT} />
      </div>
      {block.backgroundType === 'image' && (
        <div>
          <label className={LABEL}>Fokuspunkt</label>
          <FocalPointPicker src={block.backgroundSrc} current={block.styles?.objectPosition} onSelect={(pos) => upd({ styles: { ...block.styles, objectPosition: pos } })} />
        </div>
      )}
      <div>
        <label className={LABEL}>Textöverlägg</label>
        {block.overlays.map((text, i) => (
          <div key={i} className="flex gap-1.5 mb-1.5">
            <input
              type="text"
              value={text}
              onChange={(e) => {
                const next = [...block.overlays];
                next[i] = e.target.value;
                upd({ overlays: next });
              }}
              placeholder={`Överläggstext ${i + 1}…`}
              className={cn(INPUT, 'flex-1 min-w-0')}
            />
            <button onClick={() => upd({ overlays: block.overlays.filter((_, j) => j !== i) })}
              className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded">✕</button>
          </div>
        ))}
        <button onClick={() => upd({ overlays: [...block.overlays, ''] })}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mt-1">
          + Lägg till överläggstext
        </button>
      </div>
    </div>
  );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

function TimelineEditor({ block }: { block: TimelineBlock }) {
  const { updateBlock } = useBuilderStore();
  const upd = (u: Partial<TimelineBlock>) => updateBlock(block.id, u);

  function addEntry() {
    const entry: TimelineEntry = { id: generateId(), title: '', time: '', text: '', dotStyle: 'filled' };
    upd({ entries: [...block.entries, entry] });
  }
  function updateEntry(id: string, u: Partial<TimelineEntry>) {
    upd({ entries: block.entries.map((e) => e.id === id ? { ...e, ...u } : e) });
  }
  function removeEntry(id: string) {
    upd({ entries: block.entries.filter((e) => e.id !== id) });
  }

  return (
    <div className={SECTION}>
      <div>
        <label className={LABEL}>Linjebredd (px)</label>
        <input type="number" min={1} max={8} value={block.lineWidth ?? 2} onChange={(e) => upd({ lineWidth: parseInt(e.target.value) })} className={INPUT} />
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
        <input type="checkbox" checked={block.entryAnimation ?? false} onChange={(e) => upd({ entryAnimation: e.target.checked })} className="rounded" />
        Animera händelser
      </label>
      {block.entries.map((entry) => (
        <div key={entry.id} className="border border-gray-100 dark:border-gray-700 rounded-lg p-2.5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500">Händelse</span>
            <button onClick={() => removeEntry(entry.id)} className="text-xs text-red-500 px-2 py-0.5 hover:bg-red-50 dark:hover:bg-red-950 rounded">✕</button>
          </div>
          <div>
            <label className={LABEL}>Tid</label>
            <input type="text" value={entry.time} onChange={(e) => updateEntry(entry.id, { time: e.target.value })} placeholder="t.ex. 2023" className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Rubrik</label>
            <input type="text" value={entry.title} onChange={(e) => updateEntry(entry.id, { title: e.target.value })} placeholder="Rubrik…" className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Brödtext</label>
            <textarea rows={2} value={entry.text} onChange={(e) => updateEntry(entry.id, { text: e.target.value })} placeholder="Brödtext…" className={cn(INPUT, 'resize-none')} />
          </div>
          <div>
            <label className={LABEL}>Punkt-stil</label>
            <select value={entry.dotStyle ?? 'filled'} onChange={(e) => updateEntry(entry.id, { dotStyle: e.target.value as TimelineDotStyle })} className={INPUT}>
              <option value="filled">Fylld cirkel</option>
              <option value="ring">Ring</option>
              <option value="solid">Solid</option>
              <option value="diamond">Diamant</option>
              <option value="none">Ingen</option>
            </select>
          </div>
        </div>
      ))}
      <button onClick={addEntry} className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 py-1">
        + Lägg till händelse
      </button>
    </div>
  );
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

function ChatEditor({ block }: { block: ChatBlock }) {
  const { updateBlock } = useBuilderStore();
  const upd = (u: Partial<ChatBlock>) => updateBlock(block.id, u);

  function addMessage() {
    const msg: ChatMessage = { id: generateId(), role: 'sender', text: '', animate: true };
    upd({ messages: [...block.messages, msg] });
  }
  function updateMsg(id: string, u: Partial<ChatMessage>) {
    upd({ messages: block.messages.map((m) => m.id === id ? { ...m, ...u } : m) });
  }
  function removeMsg(id: string) {
    upd({ messages: block.messages.filter((m) => m.id !== id) });
  }

  return (
    <div className={SECTION}>
      <div className="flex flex-col gap-2">
        {(['showPhoneFrame', 'showStatusBar', 'showContactHeader', 'showInputBar', 'showNames'] as const).map((key) => (
          <label key={key} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            <input type="checkbox" checked={block[key] ?? false} onChange={(e) => upd({ [key]: e.target.checked })} className="rounded" />
            {key === 'showPhoneFrame' ? 'Visa telefon-ram' : key === 'showStatusBar' ? 'Statusrad' : key === 'showContactHeader' ? 'Kontakthuvud' : key === 'showInputBar' ? 'Inmatningsfält' : 'Visa namn'}
          </label>
        ))}
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className={LABEL}>Avsändarens namn</label>
          <input type="text" value={block.senderName ?? ''} onChange={(e) => upd({ senderName: e.target.value || undefined })} placeholder="Du" className={INPUT} />
        </div>
        <div className="flex-1">
          <label className={LABEL}>Mottagarens namn</label>
          <input type="text" value={block.receiverName ?? ''} onChange={(e) => upd({ receiverName: e.target.value || undefined })} placeholder="Kontakt" className={INPUT} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {block.messages.map((msg) => (
          <div key={msg.id} className="border border-gray-100 dark:border-gray-700 rounded-lg p-2 flex flex-col gap-1.5">
            <div className="flex gap-1.5 items-center">
              <select value={msg.role} onChange={(e) => updateMsg(msg.id, { role: e.target.value as ChatMessage['role'] })}
                className={cn(INPUT, 'flex-1')}>
                <option value="sender">Avsändare</option>
                <option value="receiver">Mottagare</option>
              </select>
              <button onClick={() => removeMsg(msg.id)} className="text-xs text-red-500 px-2 py-1 hover:bg-red-50 dark:hover:bg-red-950 rounded">✕</button>
            </div>
            <input type="text" value={msg.text} onChange={(e) => updateMsg(msg.id, { text: e.target.value })} placeholder="Meddelande…" className={INPUT} />
          </div>
        ))}
        <button onClick={addMessage} className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 py-1">
          + Lägg till meddelande
        </button>
      </div>
    </div>
  );
}

// ─── Carousel ─────────────────────────────────────────────────────────────────

function CarouselEditor({ block }: { block: CarouselBlock }) {
  const { updateBlock } = useBuilderStore();
  const upd = (u: Partial<CarouselBlock>) => updateBlock(block.id, u);

  function addItem() {
    const item: CarouselItem = { id: generateId(), src: '' };
    upd({ items: [...block.items, item] });
  }
  function updateItem(id: string, u: Partial<CarouselItem>) {
    upd({ items: block.items.map((item) => item.id === id ? { ...item, ...u } : item) });
  }
  function removeItem(id: string) {
    upd({ items: block.items.filter((item) => item.id !== id) });
  }

  return (
    <div className={SECTION}>
      {block.items.map((item) => (
        <div key={item.id} className="border border-gray-100 dark:border-gray-700 rounded-lg p-2.5 flex flex-col gap-2">
          <div className="flex gap-1.5">
            <input type="url" value={item.src} onChange={(e) => updateItem(item.id, { src: e.target.value })} placeholder="URL (bild eller video)…" className={cn(INPUT, 'flex-1 min-w-0')} />
            <button onClick={() => removeItem(item.id)} className="text-xs text-red-500 px-1">✕</button>
          </div>
          <input type="url" value={item.poster ?? ''} onChange={(e) => updateItem(item.id, { poster: e.target.value || undefined })} placeholder="Poster-URL (valfri)…" className={INPUT} />
          <input type="text" value={item.caption ?? ''} onChange={(e) => updateItem(item.id, { caption: e.target.value || undefined })} placeholder="Bildtext (valfri)…" className={INPUT} />
        </div>
      ))}
      <button onClick={addItem} className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 py-1">
        + Lägg till objekt
      </button>
    </div>
  );
}

// ─── ScrollyMedia ─────────────────────────────────────────────────────────────

function ScrollyMediaEditor({ block }: { block: ScrollyMediaBlock }) {
  const { updateBlock } = useBuilderStore();
  const [expandedSlide, setExpandedSlide] = useState<string | null>(null);
  const upd = (u: Partial<ScrollyMediaBlock>) => updateBlock(block.id, u);

  function addSlide() {
    const slide: ScrollySlide = { id: generateId(), backgroundType: 'image', backgroundSrc: '', overlayOpacity: 0.5 };
    upd({ slides: [...block.slides, slide] });
    setExpandedSlide(slide.id);
  }
  function updateSlide(id: string, u: Partial<ScrollySlide>) {
    upd({ slides: block.slides.map((s) => s.id === id ? { ...s, ...u } : s) });
  }
  function removeSlide(id: string) {
    upd({ slides: block.slides.filter((s) => s.id !== id) });
    if (expandedSlide === id) setExpandedSlide(null);
  }

  const base = window.location.origin + window.location.pathname;
  const projectId = new URLSearchParams(window.location.hash.replace(/^#\/edit\??/, '')).get('id');
  const scrollySrc = projectId ? `${base}#/scrolly?id=${projectId}&block=${block.id}` : '';
  const n = block.slides.length;
  const wId = `sl-w-${block.id.slice(0, 8)}`;
  const fId = `sl-f-${block.id.slice(0, 8)}`;
  const embedCode = scrollySrc
    ? `<div id="${wId}" style="height:${n * 100}vh;position:relative;">\n` +
      `  <iframe id="${fId}" src="${scrollySrc}" style="position:sticky;top:0;height:100vh;width:100%;border:none;display:block;" allow="autoplay"></iframe>\n` +
      `</div>\n` +
      `<script>(function(){` +
      `var w=document.getElementById('${wId}'),f=document.getElementById('${fId}');` +
      `window.addEventListener('message',function(e){if(e.data&&e.data.type==='storylab-scrolly-init'&&e.source===f.contentWindow){w.style.height=e.data.scrollHeight+'px';}});` +
      `window.addEventListener('scroll',function(){if(!w||!f)return;var r=w.getBoundingClientRect(),h=window.innerHeight,sh=w.offsetHeight-h;if(sh<=0)return;var p=Math.max(0,Math.min(1,-r.top/sh));f.contentWindow.postMessage({type:'storylab-scroll',progress:p},'*');});` +
      `})();<\/script>`
    : '';

  const [copied, setCopied] = useState(false);
  function copyEmbed() {
    navigator.clipboard.writeText(embedCode).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  return (
    <div className={SECTION}>
      {scrollySrc && (
        <div className="flex gap-2">
          <a href={`${base}#/scrolly?id=${projectId}&block=${block.id}&preview=1`} target="_blank" rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 rounded-md bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium hover:bg-gray-700">
            Öppna förhandsvisning ↗
          </a>
          <button onClick={copyEmbed}
            className="text-xs px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-800">
            {copied ? 'Kopierat!' : 'Kopiera inbäddningskod'}
          </button>
        </div>
      )}

      {block.slides.map((slide, i) => (
        <div key={slide.id} className="border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700">
            <span className="text-xs text-gray-500 dark:text-gray-400 w-4">{i + 1}</span>
            <button onClick={() => setExpandedSlide(expandedSlide === slide.id ? null : slide.id)}
              className="flex-1 text-left text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
              {slide.headline ?? `Sektion ${i + 1}`}
            </button>
            <button onClick={() => removeSlide(slide.id)} className="text-xs text-red-500 px-1">✕</button>
          </div>
          {expandedSlide === slide.id && (
            <div className="p-3 flex flex-col gap-3">
              <div>
                <label className={LABEL}>Bakgrundstyp</label>
                <div className="flex gap-2">
                  {(['image', 'video'] as const).map((t) => (
                    <button key={t} onClick={() => updateSlide(slide.id, { backgroundType: t })}
                      className={cn('px-3 py-1 rounded-md text-xs font-medium border transition-colors',
                        slide.backgroundType === t
                          ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-transparent'
                          : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400')}>
                      {t === 'image' ? 'Bild' : 'Video'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={LABEL}>{slide.backgroundType === 'video' ? 'Video-URL' : 'Bild-URL'}</label>
                <input type="url" value={slide.backgroundSrc} onChange={(e) => updateSlide(slide.id, { backgroundSrc: e.target.value })} placeholder="https://…" className={INPUT} />
              </div>
              {slide.backgroundType === 'image' && (
                <div>
                  <label className={LABEL}>Fokuspunkt</label>
                  <FocalPointPicker
                    src={slide.backgroundSrc}
                    current={slide.objectPosition}
                    onSelect={(pos) => updateSlide(slide.id, { objectPosition: pos })}
                  />
                </div>
              )}
              {slide.backgroundType === 'video' && (
                <div>
                  <label className={LABEL}>Poster-bild (valfri)</label>
                  <input type="url" value={slide.backgroundPoster ?? ''} onChange={(e) => updateSlide(slide.id, { backgroundPoster: e.target.value || undefined })} placeholder="https://…/poster.jpg" className={INPUT} />
                </div>
              )}
              <div>
                <label className={LABEL}>Överläggsopacitet — {Math.round((slide.overlayOpacity ?? 0.5) * 100)}%</label>
                <input type="range" min={0} max={1} step={0.05} value={slide.overlayOpacity ?? 0.5}
                  onChange={(e) => updateSlide(slide.id, { overlayOpacity: parseFloat(e.target.value) })}
                  className="w-full accent-gray-700 dark:accent-gray-300" />
              </div>
              <div>
                <label className={LABEL}>Rubrik</label>
                <input type="text" value={slide.headline ?? ''} onChange={(e) => updateSlide(slide.id, { headline: e.target.value || undefined })} placeholder="Rubrik…" className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Underrubrik</label>
                <input type="text" value={slide.subheadline ?? ''} onChange={(e) => updateSlide(slide.id, { subheadline: e.target.value || undefined })} placeholder="Underrubrik…" className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Brödtext</label>
                <textarea rows={3} value={slide.body ?? ''} onChange={(e) => updateSlide(slide.id, { body: e.target.value || undefined })} placeholder="Brödtext…" className={cn(INPUT, 'resize-none')} />
              </div>
            </div>
          )}
        </div>
      ))}
      <button onClick={addSlide}
        className="w-full rounded-lg border border-dashed border-gray-300 dark:border-gray-600 py-2 text-xs text-gray-400 hover:border-gray-400 hover:text-gray-600 dark:hover:border-gray-500 dark:hover:text-gray-300 transition-colors">
        + Lägg till sektion
      </button>
    </div>
  );
}

// ─── Focal point picker ───────────────────────────────────────────────────────

const GRID_POS: { label: string; value: string }[][] = [
  [{ label: '↖', value: 'top left' },    { label: '↑', value: 'top center' },    { label: '↗', value: 'top right' }],
  [{ label: '←', value: 'center left' }, { label: '·', value: 'center center' }, { label: '→', value: 'center right' }],
  [{ label: '↙', value: 'bottom left' }, { label: '↓', value: 'bottom center' }, { label: '↘', value: 'bottom right' }],
];

function posToPercent(pos: string): { x: number; y: number } {
  const parts = pos.trim().split(/\s+/);
  const kw: Record<string, number> = { left: 0, right: 100, top: 0, bottom: 100, center: 50 };
  const parse = (v: string) => v.endsWith('%') ? parseFloat(v) : (kw[v] ?? 50);
  const a = parse(parts[0] ?? 'center');
  const b = parse(parts[1] ?? parts[0] ?? 'center');
  const firstIsX = ['left', 'right'].includes(parts[0]) || parts[0]?.endsWith('%');
  return firstIsX || parts.length === 1 ? { x: a, y: b } : { x: b, y: a };
}

interface FocalPointPickerProps {
  src?: string;
  current?: string;
  onSelect: (pos: string) => void;
}

function FocalPointPicker({ src, current, onSelect }: FocalPointPickerProps) {
  const pos = current ?? 'center center';
  const { x, y } = posToPercent(pos);

  function handlePreviewClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const py = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    onSelect(`${px}% ${py}%`);
  }

  return (
    <div className="flex flex-col gap-2">
      {/* 3×3 quick grid */}
      <div className="grid grid-cols-3 gap-0.5 w-fit">
        {GRID_POS.map((row) =>
          row.map((cell) => {
            const active = pos === cell.value;
            return (
              <button
                key={cell.value}
                onClick={() => onSelect(cell.value)}
                title={cell.value}
                className={`w-9 h-9 flex items-center justify-center text-base rounded transition-colors ${
                  active
                    ? 'bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {cell.label}
              </button>
            );
          })
        )}
      </div>

      {/* Clickable image preview */}
      {src && (
        <div
          onClick={handlePreviewClick}
          className="relative w-full h-28 rounded-lg overflow-hidden cursor-crosshair border border-gray-200 dark:border-gray-600 select-none"
          title="Klicka för att välja fokuspunkt"
        >
          <img
            src={src}
            alt=""
            draggable={false}
            className="w-full h-full object-cover pointer-events-none"
            style={{ objectPosition: pos }}
          />
          <div
            className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <div className="w-5 h-5 rounded-full border-2 border-white shadow-md bg-white/30 ring-1 ring-black/30" />
          </div>
        </div>
      )}
    </div>
  );
}
