import { Button } from "@/components/ui/button";
import { Edit, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { TeachingTrigger } from "@/components/teaching/TeachingTrigger";
import { useTeaching } from "@/contexts/TeachingContext";

interface ClientCardProps {
  selectedClient: any;
  getClientDisplayName: (client: any) => string | null;
  isReadOnly: boolean;
  onAddClient: () => void;
}

export const ClientCard = ({
  selectedClient,
  getClientDisplayName,
  isReadOnly,
  onAddClient,
}: ClientCardProps) => {
  const { activeTeaching } = useTeaching();
  const isAddClientTeachingActive = activeTeaching?.id === 'app-job-add-client';
  
  // Only show teaching trigger when there's no client (empty state)
  const showTeachingTrigger = !selectedClient;
  
  const buttonContent = (
    <Button 
      variant="ghost" 
      size="sm"
      onClick={onAddClient}
      disabled={isReadOnly}
      className={cn(
        "shrink-0 h-8 w-8 p-0 transition-all duration-300",
        isAddClientTeachingActive && "animate-pulse ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
      data-teaching="add-client-action"
    >
      {selectedClient ? <Edit className="h-3.5 w-3.5" /> : <Plus className="h-4 w-4" />}
    </Button>
  );

  return (
    <div className="sm:col-span-2 bg-primary/5 p-4 rounded-lg border border-primary/20">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground mb-1">Client</p>
          {selectedClient ? (
            <span className="text-lg font-semibold truncate block">{getClientDisplayName(selectedClient)}</span>
          ) : (
            <span className="text-sm text-muted-foreground">No client</span>
          )}
        </div>
        {showTeachingTrigger ? (
          <TeachingTrigger teachingId="app-job-add-client" autoShowDelay={0}>
            {buttonContent}
          </TeachingTrigger>
        ) : (
          buttonContent
        )}
      </div>
    </div>
  );
};
