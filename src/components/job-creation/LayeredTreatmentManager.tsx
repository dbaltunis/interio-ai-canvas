import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, GripVertical } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface LayeredTreatment {
  id: string;
  type: string;
  template?: any;
  selectedItems?: {
    fabric?: any;
    hardware?: any;
    material?: any;
  };
  zIndex: number;
  opacity: number;
  name: string;
}

interface LayeredTreatmentManagerProps {
  treatments: LayeredTreatment[];
  onTreatmentsChange: (treatments: LayeredTreatment[]) => void;
  availableTreatmentTypes: Array<{ value: string; label: string }>;
}

const SortableTreatmentItem = ({ 
  treatment, 
  onUpdate, 
  onRemove 
}: {
  treatment: LayeredTreatment;
  onUpdate: (treatment: LayeredTreatment) => void;
  onRemove: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: treatment.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="space-y-3 p-3 border rounded-lg bg-background">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            {...attributes}
            {...listeners}
            className="cursor-grab h-6 w-6 p-0"
          >
            <GripVertical className="h-3 w-3" />
          </Button>
          <Badge variant="secondary">Layer {treatment.zIndex}</Badge>
          <span className="font-medium">{treatment.name}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(treatment.id)}
          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      <div className="grid gap-2">
        <div>
          <label className="text-xs font-medium">Treatment Type</label>
          <div className="text-sm text-muted-foreground">
            {treatment.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium">Opacity: {Math.round(treatment.opacity * 100)}%</label>
          <Slider
            value={[treatment.opacity]}
            onValueChange={([value]) => onUpdate({ ...treatment, opacity: value })}
            max={1}
            min={0.1}
            step={0.1}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
};

export const LayeredTreatmentManager = ({
  treatments,
  onTreatmentsChange,
  availableTreatmentTypes
}: LayeredTreatmentManagerProps) => {
  const [newTreatmentType, setNewTreatmentType] = useState<string>("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = treatments.findIndex(item => item.id === active.id);
      const newIndex = treatments.findIndex(item => item.id === over.id);
      
      const reorderedTreatments = arrayMove(treatments, oldIndex, newIndex);
      
      // Update z-index based on new order
      const updatedTreatments = reorderedTreatments.map((treatment, index) => ({
        ...treatment,
        zIndex: index + 1
      }));
      
      onTreatmentsChange(updatedTreatments);
    }
  };

  const addTreatment = () => {
    if (!newTreatmentType) return;

    const newTreatment: LayeredTreatment = {
      id: `treatment-${Date.now()}`,
      type: newTreatmentType,
      zIndex: treatments.length + 1,
      opacity: 1,
      name: `${newTreatmentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} ${treatments.length + 1}`
    };

    onTreatmentsChange([...treatments, newTreatment]);
    setNewTreatmentType("");
  };

  const updateTreatment = (updatedTreatment: LayeredTreatment) => {
    onTreatmentsChange(
      treatments.map(t => t.id === updatedTreatment.id ? updatedTreatment : t)
    );
  };

  const removeTreatment = (id: string) => {
    const filtered = treatments.filter(t => t.id !== id);
    // Reorder z-index after removal
    const reordered = filtered.map((treatment, index) => ({
      ...treatment,
      zIndex: index + 1
    }));
    onTreatmentsChange(reordered);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Layered Treatments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new treatment */}
        <div className="flex gap-2">
          <Select value={newTreatmentType} onValueChange={setNewTreatmentType}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select treatment type" />
            </SelectTrigger>
            <SelectContent>
              {availableTreatmentTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={addTreatment} disabled={!newTreatmentType} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Treatment list */}
        {treatments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No treatments added yet. Add your first treatment above.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={treatments.map(t => t.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {treatments.map(treatment => (
                  <SortableTreatmentItem
                    key={treatment.id}
                    treatment={treatment}
                    onUpdate={updateTreatment}
                    onRemove={removeTreatment}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {treatments.length > 0 && (
          <div className="text-xs text-muted-foreground">
            Drag treatments to reorder layers. Higher items appear in front.
          </div>
        )}
      </CardContent>
    </Card>
  );
};