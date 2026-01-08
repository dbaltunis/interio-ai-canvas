import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Ruler, Eye, Edit, Trash2, Calendar, MapPin, ExternalLink, 
  FolderOpen, Plus, FileSpreadsheet 
} from "lucide-react";
import { useClientMeasurements, useDeleteClientMeasurement } from "@/hooks/useClientMeasurements";
import { useClientProjectMeasurements, ProjectMeasurement } from "@/hooks/useClientProjectMeasurements";
import { MeasurementsCSVUpload } from "@/components/measurements/MeasurementsCSVUpload";
import { MeasurementViewDialog } from "@/components/measurements/MeasurementViewDialog";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useFormattedCurrency } from "@/hooks/useFormattedCurrency";

interface ClientMeasurementsTabProps {
  clientId: string;
  canEditClient?: boolean;
}

export const ClientMeasurementsTab = ({ clientId, canEditClient = true }: ClientMeasurementsTabProps) => {
  const [activeTab, setActiveTab] = useState("project");
  const [viewingMeasurement, setViewingMeasurement] = useState<any>(null);
  const [isProjectMeasurement, setIsProjectMeasurement] = useState(false);
  const [showCSVUpload, setShowCSVUpload] = useState(false);

  const { data: clientMeasurements = [], isLoading: clientLoading } = useClientMeasurements(clientId);
  const { data: projectMeasurements = [], isLoading: projectLoading } = useClientProjectMeasurements(clientId);
  const deleteMeasurement = useDeleteClientMeasurement();
  const navigate = useNavigate();
  const { formatCurrency } = useFormattedCurrency();

  const handleViewMeasurement = (measurement: any, isProject: boolean = false) => {
    setViewingMeasurement(measurement);
    setIsProjectMeasurement(isProject);
  };

  const handleDeleteMeasurement = async (measurementId: string) => {
    if (confirm("Are you sure you want to delete this measurement?")) {
      deleteMeasurement.mutate(measurementId);
    }
  };

  const handleOpenProject = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  // Group project measurements by project
  const measurementsByProject = projectMeasurements.reduce((acc, m) => {
    if (!acc[m.project_id]) {
      acc[m.project_id] = { name: m.project_name, measurements: [] };
    }
    acc[m.project_id].measurements.push(m);
    return acc;
  }, {} as Record<string, { name: string; measurements: ProjectMeasurement[] }>);

  const isLoading = clientLoading || projectLoading;

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => setShowCSVUpload(!showCSVUpload)}
          className="gap-2"
        >
          <FileSpreadsheet className="h-4 w-4" />
          {showCSVUpload ? 'Hide CSV Upload' : 'Import from CSV'}
        </Button>
      </div>

      {/* CSV Upload Section */}
      {showCSVUpload && (
        <MeasurementsCSVUpload 
          clientId={clientId} 
          onSuccess={() => setShowCSVUpload(false)} 
        />
      )}

      {/* Tabs for Project vs Quick Measurements */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="project" className="text-xs gap-1">
            <FolderOpen className="h-3 w-3" />
            Project Windows ({projectMeasurements.length})
          </TabsTrigger>
          <TabsTrigger value="quick" className="text-xs gap-1">
            <Ruler className="h-3 w-3" />
            Quick Measurements ({clientMeasurements.length})
          </TabsTrigger>
        </TabsList>

        {/* Project Measurements Tab */}
        <TabsContent value="project" className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : Object.keys(measurementsByProject).length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <FolderOpen className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No project measurements found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Measurements will appear here when you add windows to projects
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {Object.entries(measurementsByProject).map(([projectId, { name, measurements }]) => (
                <Card key={projectId}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{name}</CardTitle>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleOpenProject(projectId)}
                        className="gap-1 text-xs"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Open Project
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {measurements.map((m) => (
                        <div 
                          key={m.id}
                          className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                          onClick={() => handleViewMeasurement(m, true)}
                        >
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="text-sm font-medium">{m.name}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {m.room_name}
                                {m.width && m.height && (
                                  <span className="ml-2">
                                    {m.width}mm × {m.height}mm
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {m.windows_summary?.treatment_type && (
                              <Badge variant="secondary" className="text-xs">
                                {m.windows_summary.treatment_type}
                              </Badge>
                            )}
                            {m.windows_summary?.total_cost && (
                              <span className="text-xs font-medium text-green-600">
                                {formatCurrency(m.windows_summary.total_cost)}
                              </span>
                            )}
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Quick Measurements Tab */}
        <TabsContent value="quick" className="mt-4">
          {clientLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : clientMeasurements.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Ruler className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No quick measurements recorded</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Use CSV upload to import measurements
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {clientMeasurements.map((measurement) => {
                const measurementData = (measurement.measurements || {}) as Record<string, any>;
                return (
                  <Card key={measurement.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="py-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {measurement.measurement_type?.replace('_', ' ') || 'Window'}
                            </Badge>
                            {measurementData.room_name && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {measurementData.room_name}
                              </span>
                            )}
                          </div>
                          {measurementData.window_name && (
                            <p className="text-sm font-medium">{measurementData.window_name}</p>
                          )}
                          {(measurementData.width_mm || measurementData.height_mm) && (
                            <p className="text-xs text-muted-foreground">
                              {measurementData.width_mm}mm × {measurementData.height_mm}mm
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {measurement.measured_at 
                              ? format(new Date(measurement.measured_at), 'PP')
                              : 'Date not recorded'
                            }
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleViewMeasurement(measurement, false)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleViewMeasurement(measurement, false)}
                            disabled={!canEditClient}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm"
                            variant="ghost"
                            disabled={!canEditClient || deleteMeasurement.isPending}
                            onClick={() => handleDeleteMeasurement(measurement.id)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {measurement.notes && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {measurement.notes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* View/Edit Dialog */}
      <MeasurementViewDialog
        measurement={viewingMeasurement}
        isOpen={!!viewingMeasurement}
        onClose={() => setViewingMeasurement(null)}
        canEdit={canEditClient}
        isProjectMeasurement={isProjectMeasurement}
      />
    </div>
  );
};
