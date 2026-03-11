import { useBuilderStore } from '../../store/builderStore';
import type { Block, TimelineEntry, TimelineDotStyle, ChatMessage, CarouselItem } from '../../types';
import { generateId } from '../../utils/generateId';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { AnimationSelect } from './AnimationSelect';

interface Props {
  block: Block;
}

const backgroundTypeOptions = [
  { value: 'image', label: 'Bild' },
  { value: 'video', label: 'Video' },
];

export function BlockEditor({ block }: Props) {
  const { updateBlock, setAnimation } = useBuilderStore();

  const update = (fields: Partial<Block>) => updateBlock(block.id, fields);

  // Hero and sticky blocks have built-in scroll behavior — animation preset unused
  const showAnimationSelect =
    block.type !== 'hero' && block.type !== 'sticky' && block.type !== 'timeline' && block.type !== 'chat' && block.type !== 'carousel';

  return (
    <div className="mt-3 flex flex-col gap-3 border-t border-gray-200 dark:border-gray-700 pt-3">
      {showAnimationSelect && (
        <>
          <AnimationSelect
            value={block.animation}
            onChange={(animation) => setAnimation(block.id, animation)}
          />
          {block.animation !== 'none' && (
            <Input
              label="Fördröjning (sekunder)"
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={block.animationDelay ?? 0}
              onChange={(e) =>
                update({ animationDelay: Math.max(0, Number(e.target.value)) } as Partial<Block>)
              }
            />
          )}
        </>
      )}

      {block.type === 'text' && (
        <Textarea
          label="Innehåll"
          rows={4}
          value={block.content}
          placeholder="Skriv din text här…"
          onChange={(e) => update({ content: e.target.value } as Partial<Block>)}
        />
      )}

      {block.type === 'image' && (
        <>
          <Input
            label="Bild-URL"
            value={block.src}
            placeholder="https://…"
            onChange={(e) => update({ src: e.target.value } as Partial<Block>)}
          />
          <Input
            label="Alt-text"
            value={block.alt}
            placeholder="Beskriv bilden för skärmläsare"
            onChange={(e) => update({ alt: e.target.value } as Partial<Block>)}
          />
          <Input
            label="Bildtext (valfri)"
            value={block.caption ?? ''}
            placeholder="Foto: Fotografens namn"
            onChange={(e) => update({ caption: e.target.value } as Partial<Block>)}
          />
        </>
      )}

      {block.type === 'video' && (
        <>
          <Input
            label="Video-URL"
            value={block.src}
            placeholder="https://…"
            onChange={(e) => update({ src: e.target.value } as Partial<Block>)}
          />
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={block.autoplay}
              onChange={(e) => update({ autoplay: e.target.checked } as Partial<Block>)}
              className="rounded border-gray-300"
            />
            Spelas upp automatiskt i vyport
          </label>
        </>
      )}

      {block.type === 'quote' && (
        <>
          <Textarea
            label="Citat"
            rows={3}
            value={block.text}
            placeholder="«Citatet skrivs här»"
            onChange={(e) => update({ text: e.target.value } as Partial<Block>)}
          />
          <Input
            label="Källa (valfri)"
            value={block.attribution ?? ''}
            placeholder="Namn, Titel"
            onChange={(e) => update({ attribution: e.target.value } as Partial<Block>)}
          />
        </>
      )}

      {block.type === 'hero' && (
        <>
          <Select
            label="Bakgrundstyp"
            value={block.backgroundType}
            options={backgroundTypeOptions}
            onChange={(e) =>
              update({ backgroundType: e.target.value as 'image' | 'video' } as Partial<Block>)
            }
          />
          <Input
            label="Bakgrunds-URL"
            value={block.backgroundSrc}
            placeholder="https://… (bild eller .mp4)"
            onChange={(e) => update({ backgroundSrc: e.target.value } as Partial<Block>)}
          />
          <Input
            label="Rubrik"
            value={block.heading}
            placeholder="Artikelrubrik…"
            onChange={(e) => update({ heading: e.target.value } as Partial<Block>)}
          />
          <Input
            label="Underrubrik (valfri)"
            value={block.subheading ?? ''}
            placeholder="En kort introduktionsmening"
            onChange={(e) => update({ subheading: e.target.value } as Partial<Block>)}
          />
        </>
      )}

      {block.type === 'sticky' && (
        <>
          <Select
            label="Bakgrundstyp"
            value={block.backgroundType}
            options={backgroundTypeOptions}
            onChange={(e) =>
              update({ backgroundType: e.target.value as 'image' | 'video' } as Partial<Block>)
            }
          />
          <Input
            label="Bakgrunds-URL"
            value={block.backgroundSrc}
            placeholder="https://… (bild eller .mp4)"
            onChange={(e) => update({ backgroundSrc: e.target.value } as Partial<Block>)}
          />
          <Input
            label="Bakgrundens alt-text (valfri)"
            value={block.backgroundAlt ?? ''}
            placeholder="Beskriv bakgrunden för skärmläsare"
            onChange={(e) => update({ backgroundAlt: e.target.value } as Partial<Block>)}
          />

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Textöverlager
            </span>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Varje överlager tonas in när läsaren scrollar. Lägg till upp till ~5 för bäst resultat.
            </p>

            {block.overlays.map((text, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500 w-4 text-right">{i + 1}</span>
                <input
                  type="text"
                  value={text}
                  placeholder={`Överlager ${i + 1}…`}
                  onChange={(e) => {
                    const next = block.overlays.map((o, idx) => (idx === i ? e.target.value : o));
                    update({ overlays: next } as Partial<Block>);
                  }}
                  className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                />
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    update({ overlays: block.overlays.filter((_, idx) => idx !== i) } as Partial<Block>);
                  }}
                  aria-label={`Ta bort överlager ${i + 1}`}
                >
                  ✕
                </Button>
              </div>
            ))}

            <Button
              variant="secondary"
              size="sm"
              className="self-start"
              onClick={() => update({ overlays: [...block.overlays, ''] } as Partial<Block>)}
            >
              + Lägg till överlager
            </Button>
          </div>
        </>
      )}

      {block.type === 'timeline' && (
        <div className="flex flex-col gap-2">
          {/* Line width — block-level */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Linjebredd — {block.lineWidth ?? 1}px
            </label>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={block.lineWidth ?? 1}
              onChange={(e) => update({ lineWidth: Number(e.target.value) } as Partial<Block>)}
              className="w-full accent-gray-900 dark:accent-gray-400"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={block.entryAnimation ?? false}
              onChange={(e) => update({ entryAnimation: e.target.checked } as Partial<Block>)}
              className="rounded border-gray-300"
            />
            Tona in händelser vid scroll
          </label>

          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mt-1">
            Händelser
          </span>

          {block.entries.map((entry, i) => (
            <div key={entry.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Händelse {i + 1}</span>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() =>
                    update({ entries: block.entries.filter((e) => e.id !== entry.id) } as Partial<Block>)
                  }
                >
                  ✕
                </Button>
              </div>
              <Input
                label="Rubrik"
                value={entry.title}
                placeholder="Händelsetitel…"
                onChange={(e) =>
                  update({
                    entries: block.entries.map((en) =>
                      en.id === entry.id ? { ...en, title: e.target.value } : en
                    ),
                  } as Partial<Block>)
                }
              />
              <Input
                label="Tid / Datum"
                value={entry.time}
                placeholder="t.ex. 14:30 eller 15 mars 2025"
                onChange={(e) =>
                  update({
                    entries: block.entries.map((en) =>
                      en.id === entry.id ? { ...en, time: e.target.value } : en
                    ),
                  } as Partial<Block>)
                }
              />
              <Textarea
                label="Text"
                rows={2}
                value={entry.text}
                placeholder="Beskriv händelsen…"
                onChange={(e) =>
                  update({
                    entries: block.entries.map((en) =>
                      en.id === entry.id ? { ...en, text: e.target.value } : en
                    ),
                  } as Partial<Block>)
                }
              />
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={entry.showDot !== false}
                  onChange={(e) =>
                    update({
                      entries: block.entries.map((en) =>
                        en.id === entry.id ? { ...en, showDot: e.target.checked } : en
                      ),
                    } as Partial<Block>)
                  }
                  className="rounded border-gray-300"
                />
                Visa punkt på linjen
              </label>
              {entry.showDot !== false && (
                <Select
                  label="Punktstil"
                  value={entry.dotStyle ?? 'filled'}
                  options={[
                    { value: 'filled', label: 'Ring med kärna' },
                    { value: 'ring', label: 'Ring (tom)' },
                    { value: 'solid', label: 'Solid cirkel' },
                    { value: 'diamond', label: 'Diamant' },
                  ]}
                  onChange={(e) =>
                    update({
                      entries: block.entries.map((en) =>
                        en.id === entry.id ? { ...en, dotStyle: e.target.value as TimelineDotStyle } : en
                      ),
                    } as Partial<Block>)
                  }
                />
              )}
            </div>
          ))}

          <Button
            variant="secondary"
            size="sm"
            className="self-start"
            onClick={() => {
              const newEntry: TimelineEntry = { id: generateId(), title: '', time: '', text: '' };
              update({ entries: [...block.entries, newEntry] } as Partial<Block>);
            }}
          >
            + Lägg till händelse
          </Button>
        </div>
      )}

      {block.type === 'chat' && (
        <div className="flex flex-col gap-2">
          <Input
            label="Avsändarens namn (valfri)"
            value={block.senderName ?? ''}
            placeholder="Du"
            onChange={(e) => update({ senderName: e.target.value || undefined } as Partial<Block>)}
          />
          <Input
            label="Mottagarens namn (valfri)"
            value={block.receiverName ?? ''}
            placeholder="Kontakt"
            onChange={(e) => update({ receiverName: e.target.value || undefined } as Partial<Block>)}
          />

          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mt-1">
            Visa element
          </span>
          {(
            [
              { field: 'showPhoneFrame', label: 'Telefonram' },
              { field: 'showStatusBar', label: 'Statusrad' },
              { field: 'showContactHeader', label: 'Kontakthuvud' },
              { field: 'showInputBar', label: 'Inmatningsfält' },
              { field: 'showNames', label: 'Visa namn' },
            ] as { field: 'showPhoneFrame' | 'showStatusBar' | 'showContactHeader' | 'showInputBar' | 'showNames'; label: string }[]
          ).map(({ field, label }) => (
            <label key={field} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={block[field] !== false}
                onChange={(e) => update({ [field]: e.target.checked } as Partial<Block>)}
                className="rounded border-gray-300"
              />
              {label}
            </label>
          ))}

          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mt-1">
            Meddelanden
          </span>

          {block.messages.map((msg, i) => (
            <div key={msg.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Select
                  label="Roll"
                  value={msg.role}
                  options={[
                    { value: 'receiver', label: 'Mottagare (vänster)' },
                    { value: 'sender', label: 'Avsändare (höger)' },
                  ]}
                  onChange={(e) =>
                    update({
                      messages: block.messages.map((m) =>
                        m.id === msg.id ? { ...m, role: e.target.value as 'sender' | 'receiver' } : m
                      ),
                    } as Partial<Block>)
                  }
                />
                <Button
                  variant="danger"
                  size="sm"
                  className="mt-4 shrink-0"
                  onClick={() =>
                    update({ messages: block.messages.filter((m) => m.id !== msg.id) } as Partial<Block>)
                  }
                >
                  ✕
                </Button>
              </div>
              <Textarea
                label="Text"
                rows={2}
                value={msg.text}
                placeholder={`Meddelande ${i + 1}…`}
                onChange={(e) =>
                  update({
                    messages: block.messages.map((m) =>
                      m.id === msg.id ? { ...m, text: e.target.value } : m
                    ),
                  } as Partial<Block>)
                }
              />
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={msg.animate ?? false}
                  onChange={(e) =>
                    update({
                      messages: block.messages.map((m) =>
                        m.id === msg.id ? { ...m, animate: e.target.checked } : m
                      ),
                    } as Partial<Block>)
                  }
                  className="rounded border-gray-300"
                />
                Tona in vid scroll
              </label>
              {msg.animate && (
                <Input
                  label="Fördröjning (sekunder)"
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  value={msg.animationDelay ?? 0}
                  onChange={(e) =>
                    update({
                      messages: block.messages.map((m) =>
                        m.id === msg.id ? { ...m, animationDelay: Math.max(0, Number(e.target.value)) } : m
                      ),
                    } as Partial<Block>)
                  }
                />
              )}
            </div>
          ))}

          <Button
            variant="secondary"
            size="sm"
            className="self-start"
            onClick={() => {
              const newMsg: ChatMessage = { id: generateId(), role: 'receiver', text: '' };
              update({ messages: [...block.messages, newMsg] } as Partial<Block>);
            }}
          >
            + Lägg till meddelande
          </Button>
        </div>
      )}

      {block.type === 'carousel' && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            Videor
          </span>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Lägg till videor att svepa igenom.
          </p>

          {block.items.map((item, i) => (
            <div key={item.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Video {i + 1}</span>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() =>
                    update({ items: block.items.filter((it) => it.id !== item.id) } as Partial<Block>)
                  }
                >
                  ✕
                </Button>
              </div>
              <Input
                label="Video-URL"
                value={item.src}
                placeholder="https://… (.mp4)"
                onChange={(e) =>
                  update({
                    items: block.items.map((it) =>
                      it.id === item.id ? { ...it, src: e.target.value } : it
                    ),
                  } as Partial<Block>)
                }
              />
              <Input
                label="Poster-URL (valfri)"
                value={item.poster ?? ''}
                placeholder="https://… (förhandsvisningsbild)"
                onChange={(e) =>
                  update({
                    items: block.items.map((it) =>
                      it.id === item.id ? { ...it, poster: e.target.value || undefined } : it
                    ),
                  } as Partial<Block>)
                }
              />
              <Input
                label="Bildtext (valfri)"
                value={item.caption ?? ''}
                placeholder="Beskrivning av videon…"
                onChange={(e) =>
                  update({
                    items: block.items.map((it) =>
                      it.id === item.id ? { ...it, caption: e.target.value || undefined } : it
                    ),
                  } as Partial<Block>)
                }
              />
            </div>
          ))}

          <Button
            variant="secondary"
            size="sm"
            className="self-start"
            onClick={() => {
              const newItem: CarouselItem = { id: generateId(), src: '' };
              update({ items: [...block.items, newItem] } as Partial<Block>);
            }}
          >
            + Lägg till video
          </Button>
        </div>
      )}

      {/* ── Dimensioner ───────────────────────────────────────── */}
      <div className="flex flex-col gap-2 border-t border-gray-200 dark:border-gray-700 pt-3">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          Dimensioner
        </span>

        <Select
          label="Max-bredd"
          value={block.maxWidth ? 'custom' : 'auto'}
          options={[
            { value: 'auto', label: 'Automatisk' },
            { value: 'custom', label: 'Anpassad' },
          ]}
          onChange={(e) => {
            if (e.target.value === 'auto') {
              update({ maxWidth: undefined } as Partial<Block>);
            } else {
              update({ maxWidth: block.maxWidth || '800px' } as Partial<Block>);
            }
          }}
        />
        {block.maxWidth && (
          <Input
            label="Bredd"
            value={block.maxWidth}
            placeholder="t.ex. 800px, 60vw, 100%"
            onChange={(e) => update({ maxWidth: e.target.value || undefined } as Partial<Block>)}
          />
        )}

      </div>
    </div>
  );
}
