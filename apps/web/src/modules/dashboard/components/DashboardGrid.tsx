import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { WidgetContainer } from './WidgetContainer';
import type { WidgetLayoutState } from '../hooks/useDashboardLayout';
import { dashboardRegistry } from '../registry/dashboardRegistry';

interface DashboardGridProps {
  layout: WidgetLayoutState[];
  isEditing: boolean;
  onReorder: (activeId: string, overId: string) => void;
}

export function DashboardGrid({ layout, isEditing, onReorder }: DashboardGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(active.id as string, over.id as string);
    }
  };

  const visibleWidgets = layout
    .filter((w) => w.visible)
    .map((w) => dashboardRegistry.getWidget(w.id))
    .filter((w): w is NonNullable<typeof w> => w !== undefined);

  if (visibleWidgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed bg-muted/20">
        <p className="text-muted-foreground mb-2">No widgets are currently visible.</p>
        <p className="text-sm text-muted-foreground/60">Click "Customize" to add widgets to your dashboard.</p>
      </div>
    );
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={visibleWidgets.map(w => w.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-max">
          {visibleWidgets.map((widget) => (
            <WidgetContainer 
              key={widget.id} 
              widget={widget} 
              isEditing={isEditing} 
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
