import type { ImageBlock as ImageBlockType } from '../../types';

interface Props { block: ImageBlockType }

export function ImageBlock({ block }: Props) {
  const style: React.CSSProperties = {
    maxWidth: block.maxWidth ?? '100%',
    margin: '0 auto',
    borderRadius: block.styles?.borderRadius,
    boxShadow: block.styles?.boxShadow,
    overflow: 'hidden',
  };
  return (
    <figure style={style}>
      <img
        src={block.src}
        alt={block.alt}
        style={{ objectPosition: block.styles?.objectPosition }}
        className="w-full h-auto block"
      />
      {block.caption && (
        <figcaption
          className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2 px-4"
          style={{ fontFamily: block.styles?.fontFamily, fontSize: block.styles?.fontSize ? `${block.styles.fontSize}px` : undefined }}
        >
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}
