import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SyncConflict } from "@/services/calDAVSyncService";
import { useResolveConflict } from "@/hooks/useTwoWaySync";
import { AlertTriangle, Calendar, Clock, MapPin, FileText } from "lucide-react";
import { format } from "date-fns";

interface ConflictResolutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflicts: SyncConflict[];
}

export const ConflictResolutionDialog = ({ 
  open, 
  onOpenChange, 
  conflicts 
}: ConflictResolutionDialogProps) => {
  const [selectedConflictIndex, setSelectedConflictIndex] = useState(0);
  const resolveConflict = useResolveConflict();

  const currentConflict = conflicts[selectedConflictIndex];

  const handleResolve = async (resolution: 'local' | 'remote' | 'merge') => {
    if (!currentConflict) return;

    await resolveConflict.mutateAsync({
      conflict: currentConflict,
      resolution,
    });

    // Move to next conflict or close dialog if this was the last one
    if (selectedConflictIndex < conflicts.length - 1) {
      setSelectedConflictIndex(selectedConflictIndex + 1);
    } else {
      onOpenChange(false);
    }
  };

  const EventDetails = ({ event, source }: { event: any; source: 'local' | 'remote' }) => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4" />
          {source === 'local' ? 'Your Version' : 'External Calendar Version'}
          <Badge variant={source === 'local' ? 'default' : 'secondary'}>
            {source === 'local' ? 'Local' : 'Remote'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h4 className="font-medium">{event.title || event.summary}</h4>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {source === 'local' ? (
            <>
              {format(new Date(event.start_time), 'PPp')} - {format(new Date(event.end_time), 'p')}
            </>
          ) : (
            <>
              {format(new Date(event.dtstart), 'PPp')} - {format(new Date(event.dtend), 'p')}
            </>
          )}
        </div>

        {(event.location || event.location) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {event.location}
          </div>
        )}

        {(event.description || event.description) && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4 mt-0.5" />
            <p className="line-clamp-3">{event.description}</p>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Last modified: {format(new Date(source === 'local' ? event.updated_at : event.lastModified), 'PPp')}
        </div>
      </CardContent>
    </Card>
  );

  if (!currentConflict) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Resolve Sync Conflict
            <Badge variant="outline">
              {selectedConflictIndex + 1} of {conflicts.length}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-sm text-muted-foreground">
            The same event was modified in both your local calendar and the external calendar. 
            Please choose how to resolve this conflict:
          </div>

          <div className="grid grid-cols-2 gap-4">
            <EventDetails event={currentConflict.localEvent} source="local" />
            <EventDetails event={currentConflict.remoteEvent} source="remote" />
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Resolution Options:</h4>
            
            <div className="grid gap-3">
              <Button
                variant="outline"
                onClick={() => handleResolve('local')}
                disabled={resolveConflict.isPending}
                className="justify-start h-auto p-4"
              >
                <div className="text-left">
                  <div className="font-medium">Keep Your Version</div>
                  <div className="text-sm text-muted-foreground">
                    Your local changes will overwrite the external calendar
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => handleResolve('remote')}
                disabled={resolveConflict.isPending}
                className="justify-start h-auto p-4"
              >
                <div className="text-left">
                  <div className="font-medium">Keep External Version</div>
                  <div className="text-sm text-muted-foreground">
                    The external calendar changes will overwrite your local version
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => handleResolve('merge')}
                disabled={resolveConflict.isPending}
                className="justify-start h-auto p-4"
              >
                <div className="text-left">
                  <div className="font-medium">Merge Both Versions</div>
                  <div className="text-sm text-muted-foreground">
                    Combine information from both versions where possible
                  </div>
                </div>
              </Button>
            </div>
          </div>

          {conflicts.length > 1 && (
            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                variant="ghost"
                onClick={() => setSelectedConflictIndex(Math.max(0, selectedConflictIndex - 1))}
                disabled={selectedConflictIndex === 0}
              >
                Previous Conflict
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedConflictIndex + 1} of {conflicts.length} conflicts
              </span>
              <Button
                variant="ghost"
                onClick={() => setSelectedConflictIndex(Math.min(conflicts.length - 1, selectedConflictIndex + 1))}
                disabled={selectedConflictIndex === conflicts.length - 1}
              >
                Next Conflict
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};