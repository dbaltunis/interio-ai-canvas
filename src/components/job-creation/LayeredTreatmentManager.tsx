import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, GripVertical } from "lucide-react";
import { useTreatmentTypes } from "@/hooks/useTreatmentTypes";
import { useCurtainTemplates } from "@/hooks/useCurtainTemplates";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  onTreatmentsChange
}: LayeredTreatmentManagerProps) => {
  const [newTreatmentType, setNewTreatmentType] = useState<string>("");
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedTreatmentCategory, setSelectedTreatmentCategory] = useState<string>("");
  
  const { data: treatmentTypes = [], isLoading } = useTreatmentTypes();
  const { data: curtainTemplates = [] } = useCurtainTemplates();

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

  const handleTreatmentCategorySelect = (category: string) => {
    setSelectedTreatmentCategory(category);
    setShowTemplateSelector(true);
  };

  const handleTemplateSelect = (template: any) => {
    const newTreatment: LayeredTreatment = {
      id: `treatment-${Date.now()}`,
      type: selectedTreatmentCategory,
      template: template,
      zIndex: treatments.length + 1,
      opacity: 1,
      name: template.name || `${selectedTreatmentCategory} ${treatments.length + 1}`
    };

    onTreatmentsChange([...treatments, newTreatment]);
    setShowTemplateSelector(false);
    setSelectedTreatmentCategory("");
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
          <Select value={selectedTreatmentCategory} onValueChange={handleTreatmentCategorySelect}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select treatment category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="curtains">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Curtains
                  </Badge>
                  Select Curtain Template
                </div>
              </SelectItem>
              <SelectItem value="roman_blinds">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Blinds
                  </Badge>
                  Roman Blinds
                </div>
              </SelectItem>
              <SelectItem value="venetian_blinds">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Blinds
                  </Badge>
                  Venetian Blinds
                </div>
              </SelectItem>
              <SelectItem value="shutters">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Shutters
                  </Badge>
                  Shutters
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
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

      {/* Template Selection Dialog */}
      <Dialog open={showTemplateSelector} onOpenChange={setShowTemplateSelector}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Select {selectedTreatmentCategory === 'curtains' ? 'Curtain' : selectedTreatmentCategory.replace('_', ' ')} Template
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedTreatmentCategory === 'curtains' && (
              <div className="grid gap-3">
                {curtainTemplates.map(template => (
                  <div 
                    key={template.id} 
                    className="p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{template.name}</h3>
                        <div className="text-sm text-muted-foreground mt-1">
                          Fullness: {template.fullness_ratio}x • Type: {template.curtain_type}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {template.curtain_type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Created {new Date(template.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Select
                      </Button>
                    </div>
                  </div>
                ))}
                
                {curtainTemplates.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No curtain templates configured yet. 
                    <br />
                    Go to Settings → Products → Window Coverings to create templates.
                  </div>
                )}
              </div>
            )}
            
            {selectedTreatmentCategory !== 'curtains' && (
              <div className="text-center py-8 text-muted-foreground">
                {selectedTreatmentCategory.replace('_', ' ')} templates coming soon...
                <br />
                For now, a basic template will be created.
                <div className="mt-4">
                  <Button onClick={() => handleTemplateSelect({ 
                    name: `Default ${selectedTreatmentCategory.replace('_', ' ')}`,
                    type: selectedTreatmentCategory 
                  })}>
                    Create Basic Template
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};