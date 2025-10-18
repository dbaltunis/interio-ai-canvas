import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { saveQueueService } from "@/services/saveQueueService";

interface SaveStatusIndicatorProps {
  hasUnsavedChanges: boolean;
  lastSaveTime: number | null;
}

export const SaveStatusIndicator = ({
  hasUnsavedChanges,
  lastSaveTime
}: SaveStatusIndicatorProps) => {
  const [queueStatus, setQueueStatus] = useState({ queueLength: 0, processing: false, failedSaves: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setQueueStatus(saveQueueService.getStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = () => {
    if (queueStatus.processing || queueStatus.queueLength > 0) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Saving...
        </Badge>
      );
    }

    if (queueStatus.failedSaves > 0) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {queueStatus.failedSaves} Failed
        </Badge>
      );
    }

    if (hasUnsavedChanges) {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Unsaved
        </Badge>
      );
    }

    if (lastSaveTime) {
      const minutesAgo = Math.floor((Date.now() - lastSaveTime) / 1000 / 60);
      const timeText = minutesAgo === 0 ? 'Just now' : `${minutesAgo}m ago`;
      
      return (
        <Badge variant="default" className="flex items-center gap-1 bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-800">
          <CheckCircle className="h-3 w-3" />
          Saved {timeText}
        </Badge>
      );
    }

    return null;
  };

  return (
    <div className="flex items-center gap-2">
      {getStatusBadge()}
    </div>
  );
};
