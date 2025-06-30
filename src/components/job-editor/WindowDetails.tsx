
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { useSurfaces, useUpdateSurface } from "@/hooks/useSurfaces";
import { useTreatments } from "@/hooks/useTreatments";

interface WindowDetailsProps {
  selectedWindowId: string | null;
}

export const WindowDetails = ({ selectedWindowId }: WindowDetailsProps) => {
  const { data: surfaces } = useSurfaces();
  const { data: treatments } = useTreatments();
  const updateSurface = useUpdateSurface();

  const selectedSurface = surfaces?.find(surface => surface.id === selectedWindowId);
  const surfaceTreatments = treatments?.filter(treatment => treatment.window_id === selectedWindowId) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {selectedSurface ? `${selectedSurface.name} Details` : 'Select a Surface'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!selectedSurface ? (
          <div className="text-center py-12 text-muted-foreground">
            <Plus className="mx-auto h-12 w-12 mb-4" />
            <p>Select a surface to view details</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label>Surface Name</Label>
                <Input
                  value={selectedSurface.name}
                  onBlur={(e) => updateSurface.mutate({ 
                    id: selectedSurface.id, 
                    name: e.target.value 
                  })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Width (in)</Label>
                  <Input
                    type="number"
                    value={selectedSurface.width || ""}
                    onBlur={(e) => updateSurface.mutate({ 
                      id: selectedSurface.id, 
                      width: parseFloat(e.target.value) || null
                    })}
                  />
                </div>
                <div>
                  <Label>Height (in)</Label>
                  <Input
                    type="number"
                    value={selectedSurface.height || ""}
                    onBlur={(e) => updateSurface.mutate({ 
                      id: selectedSurface.id, 
                      height: parseFloat(e.target.value) || null
                    })}
                  />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={selectedSurface.notes || ""}
                  onBlur={(e) => updateSurface.mutate({ 
                    id: selectedSurface.id, 
                    notes: e.target.value 
                  })}
                  placeholder="Surface notes..."
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Treatments</h4>
                <Button size="sm" onClick={() => {
                  console.log("Create treatment for surface:", selectedSurface.id);
                }}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {surfaceTreatments && surfaceTreatments.length > 0 ? (
                <div className="space-y-2">
                  {surfaceTreatments.map((treatment) => (
                    <div key={treatment.id} className="p-2 border rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{treatment.treatment_type}</p>
                          <p className="text-sm text-muted-foreground">{treatment.fabric_type}</p>
                        </div>
                        <Badge variant="outline">{treatment.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No treatments added yet</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
