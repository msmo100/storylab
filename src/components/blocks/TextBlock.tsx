import type { TextBlock as TextBlockType } from '../../types';

interface Props {
  block: TextBlockType;
}

export function TextBlock({ block }: Props) {
  return (
    <div className="prose prose-lg max-w-none">
      <p>{block.content}</p>
    </div>
  );
}
