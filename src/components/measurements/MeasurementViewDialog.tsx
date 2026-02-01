import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit, Save, X, ExternalLink, Ruler, MapPin, Calendar } from "lucide-react";
import { useUpdateClientMeasurement } from "@/hooks/useClientMeasurements";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface MeasurementViewDialogProps {
  measurement: any;
  isOpen: boolean;
  onClose: () => void;
  canEdit?: boolean;
  isProjectMeasurement?: boolean;
}

export const MeasurementViewDialog = ({
  measurement,
  isOpen,
  onClose,
  canEdit = true,
  isProjectMeasurement = false,
}: MeasurementViewDialogProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(measurement?.notes || '');
  const [editedMeasurements, setEditedMeasurements] = useState<Record<string, any>>(
    measurement?.measurements || {}
  );
  const updateMeasurement = useUpdateClientMeasurement();
  const navigate = useNavigate();

  if (!measurement) return null;

  const handleSave = async () => {
    try {
      await updateMeasurement.mutateAsync({
        id: measurement.id,
        notes: editedNotes,
        measurements: editedMeasurements,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const handleOpenProject = () => {
    if (measurement.project_id) {
      navigate(`/project/${measurement.project_id}`);
      onClose();
    }
  };

  const renderMeasurementValue = (key: string, value: any) => {
    if (isEditing && !isProjectMeasurement) {
      return (
        <Input
          type="number"
          value={editedMeasurements[key] || ''}
          onChange={(e) => setEditedMeasurements(prev => ({
            ...prev,
            [key]: e.target.value ? parseFloat(e.target.value) : null
          }))}
          onWheel={(e) => e.currentTarget.blur()}
          className="h-8"
        />
      );
    }
    
    if (typeof value === 'number') {
      return <span className="font-medium">{value} mm</span>;
    }
    return <span className="font-medium">{value || '-'}</span>;
  };

  const measurementData = measurement.measurements || measurement.windows_summary || {};

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            {isProjectMeasurement ? 'Project Measurement' : 'Measurement Details'}
          </SheetTitle>
          <SheetDescription>
            {isProjectMeasurement 
              ? `From project: ${measurement.project_name}`
              : `Type: ${measurement.measurement_type?.replace('_', ' ') || 'Window'}`
            }
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Header Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {measurement.measured_at 
                ? format(new Date(measurement.measured_at), 'PPP')
                : 'Date not recorded'
              }
            </div>
            {isProjectMeasurement ? (
              <Button size="sm" variant="outline" onClick={handleOpenProject}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Project
              </Button>
            ) : canEdit && (
              isEditing ? (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={updateMeasurement.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )
            )}
          </div>

          {/* Room/Window Info */}
          {(measurement.room_name || measurementData.room_name) && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {measurement.room_name || measurementData.room_name}
                {(measurement.name || measurementData.window_name) && 
                  ` - ${measurement.name || measurementData.window_name}`
                }
              </span>
            </div>
          )}

          <Separator />

          {/* Measurements Grid */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Measurements</h4>
            <div className="grid grid-cols-2 gap-4">
              {/* Core Dimensions */}
              {(measurementData.width_mm || measurementData.rail_width || measurement.width) && (
                <div>
                  <Label className="text-xs text-muted-foreground">Width</Label>
                  {renderMeasurementValue('width_mm', 
                    measurementData.width_mm || measurementData.rail_width || measurement.width
                  )}
                </div>
              )}
              
              {(measurementData.height_mm || measurementData.drop || measurement.height) && (
                <div>
                  <Label className="text-xs text-muted-foreground">Height/Drop</Label>
                  {renderMeasurementValue('height_mm', 
                    measurementData.height_mm || measurementData.drop || measurement.height
                  )}
                </div>
              )}

              {measurementData.ceiling_height_mm && (
                <div>
                  <Label className="text-xs text-muted-foreground">Ceiling Height</Label>
                  {renderMeasurementValue('ceiling_height_mm', measurementData.ceiling_height_mm)}
                </div>
              )}

              {measurementData.floor_clearance_mm && (
                <div>
                  <Label className="text-xs text-muted-foreground">Floor Clearance</Label>
                  {renderMeasurementValue('floor_clearance_mm', measurementData.floor_clearance_mm)}
                </div>
              )}

              {measurementData.window_to_ceiling_mm && (
                <div>
                  <Label className="text-xs text-muted-foreground">Window to Ceiling</Label>
                  {renderMeasurementValue('window_to_ceiling_mm', measurementData.window_to_ceiling_mm)}
                </div>
              )}

              {measurementData.left_clearance_mm && (
                <div>
                  <Label className="text-xs text-muted-foreground">Left Clearance</Label>
                  {renderMeasurementValue('left_clearance_mm', measurementData.left_clearance_mm)}
                </div>
              )}

              {measurementData.right_clearance_mm && (
                <div>
                  <Label className="text-xs text-muted-foreground">Right Clearance</Label>
                  {renderMeasurementValue('right_clearance_mm', measurementData.right_clearance_mm)}
                </div>
              )}
            </div>
          </div>

          {/* Rod/Track Info */}
          {(measurementData.rod_type || measurementData.rod_length_mm) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Rod/Track Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  {measurementData.rod_type && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Rod Type</Label>
                      <Badge variant="outline" className="mt-1">
                        {measurementData.rod_type.replace('_', ' ')}
                      </Badge>
                    </div>
                  )}
                  
                  {measurementData.rod_length_mm && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Rod Length</Label>
                      {renderMeasurementValue('rod_length_mm', measurementData.rod_length_mm)}
                    </div>
                  )}

                  {measurementData.bracket_count && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Bracket Count</Label>
                      <span className="font-medium">{measurementData.bracket_count}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Treatment Info (for project measurements) */}
          {measurement.windows_summary?.treatment_type && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Treatment</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge>{measurement.windows_summary.treatment_type}</Badge>
                  {measurement.windows_summary.template_name && (
                    <Badge variant="secondary">{measurement.windows_summary.template_name}</Badge>
                  )}
                </div>
                {measurement.windows_summary.total_cost && (
                  <p className="text-sm">
                    Cost: <span className="font-medium">${measurement.windows_summary.total_cost.toFixed(2)}</span>
                  </p>
                )}
              </div>
            </>
          )}

          {/* Notes */}
          <Separator />
          <div className="space-y-2">
            <Label>Notes</Label>
            {isEditing && !isProjectMeasurement ? (
              <Textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                placeholder="Add notes about this measurement..."
                rows={3}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {measurement.notes || measurementData.notes || 'No notes'}
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
