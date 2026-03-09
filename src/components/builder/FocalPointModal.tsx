import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  src: string | undefined;
  value: string | undefined;
  onSave: (value: string | undefined) => void;
  onClose: () => void;
}

function parsePosition(v: string | undefined): { x: number; y: number } {
  if (!v) return { x: 50, y: 50 };
  const pct = v.match(/^(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/);
  if (pct) return { x: parseFloat(pct[1]), y: parseFloat(pct[2]) };
  // Handle named values from the old grid picker
  const X: Record<string, number> = { left: 0, center: 50, right: 100 };
  const Y: Record<string, number> = { top: 0, center: 50, bottom: 100 };
  let x = 50, y = 50;
  for (const w of v.trim().split(/\s+/)) {
    if (w in X) x = X[w];
    if (w in Y) y = Y[w];
  }
  return { x, y };
}

const PREVIEWS: { label: string; w: number; h: number }[] = [
  { label: 'Mobil',   w: 100, h: 170 },
  { label: 'iPad',    w: 100, h: 75  },
  { label: 'Desktop', w: 100, h: 44  },
];

export function FocalPointModal({ src, value, onSave, onClose }: Props) {
  const [pos, setPos] = useState(() => parsePosition(value));
  const areaRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const calcPos = useCallback((clientX: number, clientY: number) => {
    if (!areaRef.current) return;
    const rect = areaRef.current.getBoundingClientRect();
    setPos({
      x: Math.max(0, Math.min(100, ((clientX - rect.left)  / rect.width)  * 100)),
      y: Math.max(0, Math.min(100, ((clientY - rect.top)   / rect.height) * 100)),
    });
  }, []);

  const posStr = `${Math.round(pos.x)}% ${Math.round(pos.y)}%`;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Beskärning</span>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Klicka eller dra för att ange fokuspunkt</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex gap-5 p-5">

          {/* Editor — full image with draggable focal dot */}
          <div className="flex-1 min-w-0">
            <div
              ref={areaRef}
              className="relative cursor-crosshair overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-800 select-none"
              style={{ aspectRatio: '16 / 10' }}
              onPointerDown={(e) => {
                dragging.current = true;
                areaRef.current?.setPointerCapture(e.pointerId);
                calcPos(e.clientX, e.clientY);
              }}
              onPointerMove={(e) => { if (dragging.current) calcPos(e.clientX, e.clientY); }}
              onPointerUp={() => { dragging.current = false; }}
            >
              {src ? (
                <img
                  src={src}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                  Ingen bild
                </div>
              )}

              {/* Crosshairs */}
              <div
                className="absolute inset-y-0 w-px bg-white/60 pointer-events-none"
                style={{ left: `${pos.x}%` }}
              />
              <div
                className="absolute inset-x-0 h-px bg-white/60 pointer-events-none"
                style={{ top: `${pos.y}%` }}
              />

              {/* Focal point dot */}
              <div
                className="absolute w-5 h-5 rounded-full border-2 border-white pointer-events-none"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(255,255,255,0.35)',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.45)',
                }}
              />
            </div>
          </div>

          {/* Previews */}
          <div className="flex flex-col gap-3 flex-shrink-0" style={{ width: 100 }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Förhandsgranskning
            </p>
            {PREVIEWS.map(({ label, w, h }) => (
              <div key={label}>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1">{label}</p>
                <div
                  className="overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
                  style={{ width: w, height: h }}
                >
                  {src && (
                    <img
                      src={src}
                      alt=""
                      className="w-full h-full object-cover"
                      style={{ objectPosition: posStr }}
                      draggable={false}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-800">
          <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">{posStr}</span>
          <div className="flex gap-2">
            <button
              onClick={() => { onSave(undefined); onClose(); }}
              className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Återställ
            </button>
            <button
              onClick={() => { onSave(posStr); onClose(); }}
              className="px-3 py-1.5 text-xs rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors font-medium"
            >
              Spara
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
