import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useBuilderStore } from '../../store/builderStore';
import { BlockCard } from './BlockCard';

export function BlockList() {
  const { article, reorderBlocks } = useBuilderStore();
  const { blocks } = article;

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    reorderBlocks(arrayMove(blocks, oldIndex, newIndex));
  }

  if (blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 py-16 text-center text-gray-400 dark:text-gray-500">
        <p className="text-sm font-medium">Inga block ännu</p>
        <p className="text-xs mt-1">Använd knappen ovan för att lägga till ditt första block</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {blocks.map((block) => (
            <BlockCard key={block.id} block={block} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
