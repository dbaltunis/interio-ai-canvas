import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { KPICard } from './KPICard';
import { EnhancedKPICard } from './EnhancedKPICard';
import { KPIData, KPIConfig } from '@/hooks/useKPIConfig';

interface DraggableKPICardProps {
  kpi: KPIData;
  config: KPIConfig;
  isDragging?: boolean;
}

export const DraggableKPICard = ({ kpi, config, isDragging }: DraggableKPICardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: sortableIsDragging,
  } = useSortable({ id: kpi.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: sortableIsDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all cursor-grab active:cursor-grabbing z-10 p-1.5 bg-background/80 backdrop-blur-sm rounded-lg border border-border/50 hover:bg-background/90 hover:border-primary/30 shadow-sm"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
      </div>
      
      <EnhancedKPICard
        config={config}
        value={kpi.value}
        subtitle={kpi.subtitle}
        icon={kpi.icon}
        trend={kpi.trend}
        loading={kpi.loading}
      />
    </div>
  );
};