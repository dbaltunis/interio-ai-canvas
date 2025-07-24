
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Square, RectangleHorizontal, MoreHorizontal, Edit2, Trash2, Plus, Check, X } from "lucide-react";
import { MeasurementWorksheet } from "../measurements/MeasurementWorksheet";
import { useMeasurementWorkflow } from "@/hooks/useMeasurementWorkflow";
import { useProjects } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";

interface SurfaceListProps {
  surfaces: any[];
  treatments: any[];
  projectId: string;
  onUpdateSurface: (surfaceId: string, updates: any) => void;
  onDeleteSurface: (surfaceId: string) => void;
  onCreateTreatment?: (roomId: string, surfaceId: string, treatmentType: string, treatmentData?: any) => void;
}

const TREATMENT_TYPES = [
  "Curtains",
  "Blinds",
  "Shutters",
  "Valances",
  "Roman Shades",
  "Panel Track",
  "Vertical Blinds",
  "Other"
];

export const SurfaceList = ({ 
  surfaces, 
  treatments, 
  projectId, 
  onUpdateSurface, 
  onDeleteSurface,
  onCreateTreatment
}: SurfaceListProps) => {
  const [editingSurfaceId, setEditingSurfaceId] = useState<string | null>(null);
  const [editingSurfaceName, setEditingSurfaceName] = useState("");
  const [selectedTreatmentType, setSelectedTreatmentType] = useState<string>("Curtains");
  const [surfaceForTreatment, setSurfaceForTreatment] = useState<string | null>(null);

  const { data: projects } = useProjects();
  const { data: clients } = useClients();
  const project = projects?.find(p => p.id === projectId);
  const client = clients?.find(c => c.id === project?.client_id);

  const {
    isWorksheetOpen,
    currentWorkflowData,
    startMeasurementWorkflow,
    completeMeasurementWorkflow,
    closeWorksheet
  } = useMeasurementWorkflow();

  const handleStartEdit = (surface: any) => {
    setEditingSurfaceId(surface.id);
    setEditingSurfaceName(surface.name);
  };

  const handleSaveEdit = (surfaceId: string, newName: string) => {
    onUpdateSurface(surfaceId, { name: newName });
    setEditingSurfaceId(null);
  };

  const handleCancelEdit = () => {
    setEditingSurfaceId(null);
    setEditingSurfaceName("");
  };

  const handleCreateTreatment = (surface: any) => {
    if (onCreateTreatment) {
      // Use the prop function if provided (legacy behavior)
      onCreateTreatment(surface.room_id, surface.id, selectedTreatmentType);
    } else {
      // Use the new measurement workflow
      startMeasurementWorkflow({
        roomId: surface.room_id,
        surfaceId: surface.id,
        treatmentType: selectedTreatmentType,
        projectId: projectId,
        clientId: project?.client_id
      });
    }
    setSurfaceForTreatment(null);
  };

  const getSurfaceIcon = (surfaceType: string) => {
    switch (surfaceType) {
      case 'window':
        return <Square className="h-4 w-4" />;
      case 'door':
        return <RectangleHorizontal className="h-4 w-4" />;
      default:
        return <Square className="h-4 w-4" />;
    }
  };

  const getSurfaceTreatments = (surfaceId: string) => {
    return treatments.filter(t => t.window_id === surfaceId);
  };

  const getTreatmentStatusColor = (status: string) => {
    switch (status) {
      case 'measured':
        return 'bg-blue-100 text-blue-800';
      case 'quoted':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'in_production':
        return 'bg-purple-100 text-purple-800';
      case 'installed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (surfaces.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Square className="mx-auto h-12 w-12 mb-4" />
        <p>No surfaces added yet</p>
        <p className="text-sm">Click "Add Window" to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {surfaces.map((surface) => {
        const surfaceTreatments = getSurfaceTreatments(surface.id);
        const isEditing = editingSurfaceId === surface.id;
        
        return (
          <Card key={surface.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getSurfaceIcon(surface.surface_type)}
                  {isEditing ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        value={editingSurfaceName}
                        onChange={(e) => setEditingSurfaceName(e.target.value)}
                        className="w-32"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSaveEdit(surface.id, editingSurfaceName)}
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
                    <CardTitle className="text-base">{surface.name}</CardTitle>
                  )}
                </div>
                
                {!isEditing && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleStartEdit(surface)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Name
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDeleteSurface(surface.id)} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              
              {!isEditing && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {surface.width && surface.height 
                      ? `${surface.width}" × ${surface.height}"`
                      : "No dimensions set"
                    }
                  </span>
                  <span>{surfaceTreatments.length} treatments</span>
                </div>
              )}
            </CardHeader>
            
            <CardContent>
              {/* Existing Treatments */}
              {surfaceTreatments.length > 0 && (
                <div className="space-y-2 mb-4">
                  <div className="text-sm font-medium text-gray-700">Treatments:</div>
                  {surfaceTreatments.map((treatment) => (
                    <div key={treatment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{treatment.treatment_type}</span>
                        {treatment.fabric_type && (
                          <span className="text-sm text-gray-500">({treatment.fabric_type})</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getTreatmentStatusColor(treatment.status)}>
                          {treatment.status}
                        </Badge>
                        {treatment.total_price && (
                          <span className="text-sm font-medium">${treatment.total_price}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add Treatment Section */}
              {surfaceForTreatment === surface.id ? (
                <div className="border-t pt-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Select value={selectedTreatmentType} onValueChange={setSelectedTreatmentType}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TREATMENT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      size="sm" 
                      onClick={() => handleCreateTreatment(surface)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Configure Treatment
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setSurfaceForTreatment(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-t pt-4">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setSurfaceForTreatment(surface.id)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Treatment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Measurement Worksheet Dialog */}
      {isWorksheetOpen && currentWorkflowData && (
        <MeasurementWorksheet
          isOpen={isWorksheetOpen}
          onClose={closeWorksheet}
          onSave={completeMeasurementWorkflow}
          client={client ? {
            id: client.id,
            name: client.name
          } : undefined}
          project={{
            id: projectId,
            name: project?.name || "Project"
          }}
          roomId={currentWorkflowData.roomId}
          surfaceId={currentWorkflowData.surfaceId}
          treatmentType={currentWorkflowData.treatmentType}
          isJobFlow={true}
        />
      )}
    </div>
  );
};
