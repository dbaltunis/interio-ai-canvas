import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calendar, Clock, Users } from "lucide-react";
import { format } from "date-fns";

interface ConflictDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflictingEvents: any[];
  proposedSlot: {
    date: Date;
    time: string;
  };
  onCreateAnyway: () => void;
  onMarkAsBusy: () => void;
  onCancel: () => void;
}

export const ConflictDialog = ({
  open,
  onOpenChange,
  conflictingEvents,
  proposedSlot,
  onCreateAnyway,
  onMarkAsBusy,
  onCancel
}: ConflictDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="h-5 w-5" />
            Schedule Conflict Detected
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-orange-800 mb-2">
              <Calendar className="h-4 w-4" />
              Proposed Time Slot
            </div>
            <div className="text-sm text-orange-700">
              {format(proposedSlot.date, 'EEEE, MMM d, yyyy')} at {proposedSlot.time}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Conflicting Events ({conflictingEvents.length})
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {conflictingEvents.map((event, index) => (
                <div key={index} className="bg-red-50 border border-red-200 rounded p-2">
                  <div className="text-sm font-medium text-red-800">
                    {event.title}
                  </div>
                  <div className="text-xs text-red-600">
                    {format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}
                    {event.isBooking && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                        Booked
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="text-sm text-gray-600">
              What would you like to do?
            </div>
            
            <div className="grid gap-2">
              <Button
                onClick={onCreateAnyway}
                variant="outline"
                className="justify-start"
              >
                <Users className="h-4 w-4 mr-2" />
                Create Overlapping Event
                <span className="text-xs text-muted-foreground ml-auto">
                  Allow double booking
                </span>
              </Button>
              
              <Button
                onClick={onMarkAsBusy}
                variant="outline"
                className="justify-start"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Mark Time as Busy
                <span className="text-xs text-muted-foreground ml-auto">
                  Block the slot
                </span>
              </Button>
              
              <Button
                onClick={onCancel}
                variant="ghost"
                className="justify-start"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Choose Different Time
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};