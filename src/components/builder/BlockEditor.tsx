import { useBuilderStore } from '../../store/builderStore';
import type { Block, Annotation, ScrollImage, TextEntrance } from '../../types';
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
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
];

export function BlockEditor({ block }: Props) {
  const { updateBlock, setAnimation } = useBuilderStore();

  const update = (fields: Partial<Block>) => updateBlock(block.id, fields);

  // Hero, sticky, annotated, and scrollmedia blocks have built-in scroll behavior — animation preset unused
  const showAnimationSelect =
    block.type !== 'hero' && block.type !== 'sticky' && block.type !== 'annotated' && block.type !== 'scrollmedia';

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
              label="Delay (seconds)"
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
          label="Content"
          rows={4}
          value={block.content}
          placeholder="Write your text here…"
          onChange={(e) => update({ content: e.target.value } as Partial<Block>)}
        />
      )}

      {block.type === 'image' && (
        <>
          <Input
            label="Image URL"
            value={block.src}
            placeholder="https://…"
            onChange={(e) => update({ src: e.target.value } as Partial<Block>)}
          />
          <Input
            label="Alt text"
            value={block.alt}
            placeholder="Describe the image for screen readers"
            onChange={(e) => update({ alt: e.target.value } as Partial<Block>)}
          />
          <Input
            label="Caption (optional)"
            value={block.caption ?? ''}
            placeholder="Photo: Photographer Name"
            onChange={(e) => update({ caption: e.target.value } as Partial<Block>)}
          />
        </>
      )}

      {block.type === 'video' && (
        <>
          <Input
            label="Video URL"
            value={block.src}
            placeholder="https://… (.mp4)"
            onChange={(e) => update({ src: e.target.value } as Partial<Block>)}
          />
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={block.autoplay}
              onChange={(e) => update({ autoplay: e.target.checked } as Partial<Block>)}
              className="rounded border-gray-300"
            />
            Autoplay when in view
          </label>
        </>
      )}

      {block.type === 'quote' && (
        <>
          <Textarea
            label="Quote text"
            rows={3}
            value={block.text}
            placeholder="«The quote goes here»"
            onChange={(e) => update({ text: e.target.value } as Partial<Block>)}
          />
          <Input
            label="Attribution (optional)"
            value={block.attribution ?? ''}
            placeholder="Name, Title"
            onChange={(e) => update({ attribution: e.target.value } as Partial<Block>)}
          />
        </>
      )}

      {block.type === 'hero' && (
        <>
          <Select
            label="Background type"
            value={block.backgroundType}
            options={backgroundTypeOptions}
            onChange={(e) =>
              update({ backgroundType: e.target.value as 'image' | 'video' } as Partial<Block>)
            }
          />
          <Input
            label="Background URL"
            value={block.backgroundSrc}
            placeholder="https://… (image or .mp4)"
            onChange={(e) => update({ backgroundSrc: e.target.value } as Partial<Block>)}
          />
          <Input
            label="Heading"
            value={block.heading}
            placeholder="Article headline…"
            onChange={(e) => update({ heading: e.target.value } as Partial<Block>)}
          />
          <Input
            label="Subheading (optional)"
            value={block.subheading ?? ''}
            placeholder="A short intro sentence"
            onChange={(e) => update({ subheading: e.target.value } as Partial<Block>)}
          />
        </>
      )}

      {block.type === 'sticky' && (
        <>
          <Select
            label="Background type"
            value={block.backgroundType}
            options={backgroundTypeOptions}
            onChange={(e) =>
              update({ backgroundType: e.target.value as 'image' | 'video' } as Partial<Block>)
            }
          />
          <Input
            label="Background URL"
            value={block.backgroundSrc}
            placeholder="https://… (image or .mp4)"
            onChange={(e) => update({ backgroundSrc: e.target.value } as Partial<Block>)}
          />
          <Input
            label="Background alt text (optional)"
            value={block.backgroundAlt ?? ''}
            placeholder="Describe the background for screen readers"
            onChange={(e) => update({ backgroundAlt: e.target.value } as Partial<Block>)}
          />

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Text overlays
            </span>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Each overlay cross-fades as the reader scrolls. Add up to ~5 for best results.
            </p>

            {block.overlays.map((text, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500 w-4 text-right">{i + 1}</span>
                <input
                  type="text"
                  value={text}
                  placeholder={`Overlay ${i + 1}…`}
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
                  aria-label={`Remove overlay ${i + 1}`}
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
              + Add overlay
            </Button>
          </div>
        </>
      )}
      {block.type === 'annotated' && (
        <>
          <Select
            label="Background type"
            value={block.backgroundType}
            options={backgroundTypeOptions}
            onChange={(e) =>
              update({ backgroundType: e.target.value as 'image' | 'video' } as Partial<Block>)
            }
          />
          <Input
            label="Background URL"
            value={block.backgroundSrc}
            placeholder="https://… (image or .mp4)"
            onChange={(e) => update({ backgroundSrc: e.target.value } as Partial<Block>)}
          />
          <Input
            label="Background alt text (optional)"
            value={block.backgroundAlt ?? ''}
            placeholder="Describe the background for screen readers"
            onChange={(e) => update({ backgroundAlt: e.target.value } as Partial<Block>)}
          />

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Annotations
            </span>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Each annotation appears at its position on the image as you scroll. Use X/Y (0–100%) to place it.
            </p>

            {block.annotations.map((ann, i) => (
              <div key={ann.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Annotation {i + 1}</span>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() =>
                      update({
                        annotations: block.annotations.filter((a) => a.id !== ann.id),
                      } as Partial<Block>)
                    }
                  >
                    ✕
                  </Button>
                </div>
                <input
                  type="text"
                  value={ann.text}
                  placeholder="Describe what you're pointing to…"
                  onChange={(e) =>
                    update({
                      annotations: block.annotations.map((a) =>
                        a.id === ann.id ? { ...a, text: e.target.value } : a
                      ),
                    } as Partial<Block>)
                  }
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      X — {ann.x}% from left
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={ann.x}
                      onChange={(e) =>
                        update({
                          annotations: block.annotations.map((a) =>
                            a.id === ann.id ? { ...a, x: Number(e.target.value) } : a
                          ),
                        } as Partial<Block>)
                      }
                      className="w-full accent-gray-900 dark:accent-gray-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      Y — {ann.y}% from top
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={ann.y}
                      onChange={(e) =>
                        update({
                          annotations: block.annotations.map((a) =>
                            a.id === ann.id ? { ...a, y: Number(e.target.value) } : a
                          ),
                        } as Partial<Block>)
                      }
                      className="w-full accent-gray-900 dark:accent-gray-400"
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button
              variant="secondary"
              size="sm"
              className="self-start"
              onClick={() => {
                const newAnnotation: Annotation = {
                  id: generateId(),
                  text: '',
                  x: 50,
                  y: 50,
                };
                update({ annotations: [...block.annotations, newAnnotation] } as Partial<Block>);
              }}
            >
              + Add annotation
            </Button>
          </div>
        </>
      )}

      {block.type === 'scrollmedia' && (
        <>
          <Select
            label="Text alignment"
            value={block.textPosition}
            options={[
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' },
              { value: 'right', label: 'Right' },
            ]}
            onChange={(e) =>
              update({ textPosition: e.target.value as 'left' | 'center' | 'right' } as Partial<Block>)
            }
          />
          <Select
            label="Text entrance"
            value={block.textEntrance}
            options={[
              { value: 'none', label: 'None' },
              { value: 'fade', label: 'Fade in' },
              { value: 'from-left', label: 'From left' },
              { value: 'from-right', label: 'From right' },
            ]}
            onChange={(e) =>
              update({ textEntrance: e.target.value as TextEntrance } as Partial<Block>)
            }
          />
          <Select
            label="Media type"
            value={block.mediaType}
            options={[
              { value: 'image', label: 'Image' },
              { value: 'video', label: 'Video' },
            ]}
            onChange={(e) =>
              update({ mediaType: e.target.value as 'image' | 'video' } as Partial<Block>)
            }
          />
          <Textarea
            label="Sticky text"
            rows={4}
            value={block.text}
            placeholder="The narrative that stays in view while images scroll past…"
            onChange={(e) => update({ text: e.target.value } as Partial<Block>)}
          />

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Scrolling images
            </span>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Adjust scroll duration to control how long a reader spends on each image (1 = one viewport height).
            </p>

            {block.images.map((img, i) => (
              <div key={img.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {block.mediaType === 'video' ? 'Video' : 'Image'} {i + 1}
                  </span>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() =>
                      update({
                        images: block.images.filter((im) => im.id !== img.id),
                      } as Partial<Block>)
                    }
                  >
                    ✕
                  </Button>
                </div>
                <Input
                  label="URL"
                  value={img.src}
                  placeholder="https://… (image or .mp4)"
                  onChange={(e) =>
                    update({
                      images: block.images.map((im) =>
                        im.id === img.id ? { ...im, src: e.target.value } : im
                      ),
                    } as Partial<Block>)
                  }
                />
                <Input
                  label="Alt text (optional)"
                  value={img.alt ?? ''}
                  placeholder="Describe for screen readers"
                  onChange={(e) =>
                    update({
                      images: block.images.map((im) =>
                        im.id === img.id ? { ...im, alt: e.target.value } : im
                      ),
                    } as Partial<Block>)
                  }
                />
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Scroll duration — {img.scrollVh ?? 1}× viewport
                  </label>
                  <input
                    type="range"
                    min={0.5}
                    max={5}
                    step={0.5}
                    value={img.scrollVh ?? 1}
                    onChange={(e) =>
                      update({
                        images: block.images.map((im) =>
                          im.id === img.id ? { ...im, scrollVh: Number(e.target.value) } : im
                        ),
                      } as Partial<Block>)
                    }
                    className="w-full accent-gray-900 dark:accent-gray-400"
                  />
                </div>
              </div>
            ))}

            <Button
              variant="secondary"
              size="sm"
              className="self-start"
              onClick={() => {
                const newImage: ScrollImage = { id: generateId(), src: '', alt: '' };
                update({ images: [...block.images, newImage] } as Partial<Block>);
              }}
            >
              + Add {block.mediaType === 'video' ? 'video' : 'image'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
