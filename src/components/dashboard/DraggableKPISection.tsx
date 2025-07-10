import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { DraggableKPICard } from './DraggableKPICard';
import { KPIData, KPIConfig } from '@/hooks/useKPIConfig';

interface DraggableKPISectionProps {
  title: string;
  kpis: KPIData[];
  kpiConfigs: KPIConfig[];
  onReorder: (activeId: string, overId: string) => void;
}

export const DraggableKPISection = ({ title, kpis, kpiConfigs, onReorder }: DraggableKPISectionProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      onReorder(active.id as string, over.id as string);
    }
  };

  if (kpis.length === 0 || !kpiConfigs || kpiConfigs.length === 0) return null;

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={kpis.map(kpi => kpi.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi) => {
              const config = kpiConfigs?.find(c => c.id === kpi.id);
              return config ? (
                <DraggableKPICard key={kpi.id} kpi={kpi} config={config} />
              ) : null;
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};