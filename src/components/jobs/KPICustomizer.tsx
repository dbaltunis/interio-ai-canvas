
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Settings, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

interface KPIItem {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface KPICustomizerProps {
  availableKPIs: KPIItem[];
  onKPIChange: (kpis: KPIItem[]) => void;
}

export const KPICustomizer = ({ availableKPIs, onKPIChange }: KPICustomizerProps) => {
  const [kpis, setKPIs] = useState<KPIItem[]>(availableKPIs);
  const [isOpen, setIsOpen] = useState(false);

  const handleKPIToggle = (id: string) => {
    const updatedKPIs = kpis.map(kpi => 
      kpi.id === id ? { ...kpi, enabled: !kpi.enabled } : kpi
    );
    setKPIs(updatedKPIs);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(kpis);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setKPIs(items);
  };

  const handleSave = () => {
    onKPIChange(kpis);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Customize KPIs
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Customize KPI Dashboard</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select and reorder the KPIs you want to display on your dashboard.
          </p>
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="kpi-list">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {kpis.map((kpi, index) => (
                    <Draggable key={kpi.id} draggableId={kpi.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="flex items-center space-x-3 p-3 border rounded-lg"
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-move"
                          >
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Checkbox
                            id={kpi.id}
                            checked={kpi.enabled}
                            onCheckedChange={() => handleKPIToggle(kpi.id)}
                          />
                          <div className="flex-1">
                            <Label htmlFor={kpi.id} className="font-medium cursor-pointer">
                              {kpi.label}
                            </Label>
                            <p className="text-xs text-muted-foreground">{kpi.description}</p>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
