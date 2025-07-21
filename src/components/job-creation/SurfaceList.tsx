import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Window, Square, Plus, Edit2, Trash2, Check, X } from "lucide-react";

interface SurfaceListProps {
  surfaces: any[];
  treatments: any[];
  onAddTreatment: (surfaceId: string, treatmentType: string) => void;
  onUpdateSurface: (surfaceId: string, updates: any) => void;
  onDeleteSurface: (surfaceId: string) => void;
}

export const SurfaceList = ({
  surfaces,
  treatments,
  onAddTreatment,
  onUpdateSurface,
  onDeleteSurface
}: SurfaceListProps) => {
  const [editingSurface, setEditingSurface] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleStartEdit = (surface: any) => {
    setEditingSurface(surface.id);
    setEditingName(surface.name);
  };

  const handleSaveEdit = (surfaceId: string) => {
    onUpdateSurface(surfaceId, { name: editingName });
    setEditingSurface(null);
  };

  const handleCancelEdit = () => {
    setEditingSurface(null);
    setEditingName("");
  };

  const getSurfaceTreatments = (surfaceId: string) => {
    return treatments.filter(t => t.window_id === surfaceId);
  };

  const treatmentTypes = [
    { id: 'curtains', label: 'Curtains' },
    { id: 'blinds', label: 'Blinds' },
    { id: 'shutters', label: 'Shutters' },
    { id: 'valance', label: 'Valance' },
    { id: 'shade', label: 'Shade' }
  ];

  return (
    <div className="space-y-3">
      {surfaces.map((surface) => {
        const surfaceTreatments = getSurfaceTreatments(surface.id);
        const isEditing = editingSurface === surface.id;

        return (
          <div key={surface.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                {surface.surface_type === 'window' ? (
                  <Window className="h-5 w-5 text-brand-primary" />
                ) : (
                  <Square className="h-5 w-5 text-brand-primary" />
                )}
                
                {isEditing ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="h-8 w-32"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSaveEdit(surface.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <h4 className="font-medium text-gray-900">{surface.name}</h4>
                      <p className="text-sm text-gray-500">
                        {surface.width}" × {surface.height}"
                      </p>
                    </div>
                  </>
                )}
              </div>

              {!isEditing && (
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleStartEdit(surface)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteSurface(surface.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Existing Treatments */}
            {surfaceTreatments.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-2">
                  {surfaceTreatments.map((treatment) => (
                    <Badge key={treatment.id} variant="default" className="capitalize">
                      {treatment.treatment_type} - ${treatment.total_price || 0}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Add Treatment Buttons */}
            <div className="flex flex-wrap gap-2">
              {treatmentTypes.map((type) => (
                <Button
                  key={type.id}
                  size="sm"
                  variant="outline"
                  onClick={() => onAddTreatment(surface.id, type.id)}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {type.label}
                </Button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
