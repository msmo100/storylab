import type { ImageBlock as ImageBlockType } from '../../types';

interface Props {
  block: ImageBlockType;
}

export function ImageBlock({ block }: Props) {
  return (
    <figure>
      <img
        src={block.src}
        alt={block.alt}
        className="w-full object-cover"
        style={{
          boxShadow: block.styles?.boxShadow,
          outline: block.styles?.outlineColor
            ? `${block.styles.outlineWidth ?? '2px'} solid ${block.styles.outlineColor}`
            : undefined,
          borderRadius: block.styles?.borderRadius,
          objectPosition: block.styles?.objectPosition,
        }}
      />
      {block.caption && (
        <figcaption className="mt-2 text-sm text-center text-gray-500">{block.caption}</figcaption>
      )}
    </figure>
  );
}
