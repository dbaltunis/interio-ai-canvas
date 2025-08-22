
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Ruler, Plus, Eye, Calendar, MapPin } from "lucide-react";
import { useClientMeasurements } from "@/hooks/useClientMeasurements";
import { useClientJobs } from "@/hooks/useClientJobs";

interface QuickMeasurementAccessProps {
  clientId: string;
  clientName: string;
}

export const QuickMeasurementAccess = ({ clientId, clientName }: QuickMeasurementAccessProps) => {
  const { data: measurements, isLoading: measurementsLoading } = useClientMeasurements(clientId);
  const { data: projects } = useClientJobs(clientId);
  const [showMeasurements, setShowMeasurements] = useState(false);

  // Get measurements from both direct client measurements and project-linked measurements
  const allMeasurements = measurements || [];
  const projectMeasurements = projects?.flatMap(project => 
    allMeasurements.filter(m => m.project_id === project.id)
  ) || [];

  const totalMeasurements = allMeasurements.length;
  const recentMeasurements = allMeasurements.slice(0, 3);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Measurements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-brand-primary">{totalMeasurements}</p>
              <p className="text-sm text-muted-foreground">Total measurements</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMeasurements(true)}
              disabled={measurementsLoading}
            >
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>

          {recentMeasurements.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Recent:</p>
              {recentMeasurements.map((measurement) => (
                <div key={measurement.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="text-sm font-medium">{measurement.measurement_type.replace('_', ' ')}</p>
                    {measurement.measured_at && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(measurement.measured_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {measurement.project_id ? 'Project' : 'Client'}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {totalMeasurements === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <Ruler className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No measurements yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Measurements Detail Dialog */}
      <Dialog open={showMeasurements} onOpenChange={setShowMeasurements}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>All Measurements for {clientName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {allMeasurements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Ruler className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No measurements found for this client</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {allMeasurements.map((measurement) => {
                  const relatedProject = projects?.find(p => p.id === measurement.project_id);
                  
                  return (
                    <Card key={measurement.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium">
                              {measurement.measurement_type.replace('_', ' ').toUpperCase()}
                            </h4>
                            {relatedProject && (
                              <p className="text-sm text-muted-foreground">
                                Project: {relatedProject.name}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={measurement.project_id ? "default" : "secondary"}>
                              {measurement.project_id ? 'Project Linked' : 'Client Direct'}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium">Measurements:</h5>
                            <div className="bg-muted/30 p-3 rounded text-sm">
                              {Object.entries(measurement.measurements || {}).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="capitalize">{key.replace('_', ' ')}:</span>
                                  <span className="font-medium">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {measurement.measured_at 
                                  ? new Date(measurement.measured_at).toLocaleDateString()
                                  : 'Date not recorded'
                                }
                              </span>
                            </div>
                            {measurement.measured_by && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Measured by: {measurement.measured_by}</span>
                              </div>
                            )}
                            {measurement.photos && measurement.photos.length > 0 && (
                              <div className="text-sm text-muted-foreground">
                                📷 {measurement.photos.length} photo(s) attached
                              </div>
                            )}
                          </div>
                        </div>

                        {measurement.notes && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm text-muted-foreground mb-1">Notes:</p>
                            <p className="text-sm">{measurement.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
