import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useBuilderStore } from '../../store/builderStore';
import { BlockCard } from './BlockCard';

interface Props {
  selectedBlockId: string | null;
  onSelect: (id: string) => void;
}

export function BlockList({ selectedBlockId, onSelect }: Props) {
  const { article, reorderBlocks } = useBuilderStore();
  const { blocks } = article;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    reorderBlocks(arrayMove(blocks, oldIndex, newIndex));
  }

  if (blocks.length === 0) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
        Inga block ännu. Lägg till ett via knappen ovan.
      </p>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {blocks.map((block) => (
            <BlockCard
              key={block.id}
              block={block}
              isSelected={selectedBlockId === block.id}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
