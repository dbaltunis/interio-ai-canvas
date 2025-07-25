import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Calendar, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";

interface ConflictEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  location?: string;
  source: 'local' | 'caldav';
  calendar_name?: string;
}

interface SyncConflictDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflicts: ConflictEvent[];
  onResolve: (resolutions: { [key: string]: 'local' | 'remote' | 'merge' }) => void;
}

export const SyncConflictDialog = ({ 
  open, 
  onOpenChange, 
  conflicts, 
  onResolve 
}: SyncConflictDialogProps) => {
  const [resolutions, setResolutions] = useState<{ [key: string]: 'local' | 'remote' | 'merge' }>({});

  const handleResolutionChange = (conflictId: string, resolution: 'local' | 'remote' | 'merge') => {
    setResolutions(prev => ({
      ...prev,
      [conflictId]: resolution
    }));
  };

  const handleResolveAll = () => {
    onResolve(resolutions);
    setResolutions({});
    onOpenChange(false);
  };

  const allResolved = conflicts.every(conflict => resolutions[conflict.id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Sync Conflicts Detected
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We found {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} between your local events and calendar events. 
            Please choose how to resolve each conflict.
          </p>

          <div className="space-y-4">
            {conflicts.map((conflict, index) => (
              <div key={conflict.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Conflict #{index + 1}</h4>
                  <Badge variant="outline" className="text-xs">
                    {conflict.source === 'local' ? 'Local Event' : 'Calendar Event'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Local Version */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">Local Version</span>
                    </div>
                    <div className="text-sm space-y-1 pl-6">
                      <div><strong>Title:</strong> {conflict.title}</div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {format(new Date(conflict.start_time), 'MMM d, h:mm a')} - 
                          {format(new Date(conflict.end_time), 'h:mm a')}
                        </span>
                      </div>
                      {conflict.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{conflict.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Remote Version */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">Calendar Version</span>
                      {conflict.calendar_name && (
                        <Badge variant="secondary" className="text-xs">
                          {conflict.calendar_name}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm space-y-1 pl-6">
                      <div><strong>Title:</strong> {conflict.title}</div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {format(new Date(conflict.start_time), 'MMM d, h:mm a')} - 
                          {format(new Date(conflict.end_time), 'h:mm a')}
                        </span>
                      </div>
                      {conflict.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{conflict.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <label className="text-sm font-medium">Resolution:</label>
                  <div className="flex gap-2">
                    <Button
                      variant={resolutions[conflict.id] === 'local' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleResolutionChange(conflict.id, 'local')}
                    >
                      Keep Local
                    </Button>
                    <Button
                      variant={resolutions[conflict.id] === 'remote' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleResolutionChange(conflict.id, 'remote')}
                    >
                      Keep Calendar
                    </Button>
                    <Button
                      variant={resolutions[conflict.id] === 'merge' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleResolutionChange(conflict.id, 'merge')}
                    >
                      Merge Both
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex gap-2">
            <Button
              onClick={handleResolveAll}
              disabled={!allResolved}
              className="flex-1"
            >
              Resolve All Conflicts
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};