import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent, 
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useClients, useUpdateClient } from "@/hooks/useClients";
import { FUNNEL_STAGES } from "@/constants/clientConstants";
import { 
  Mail, 
  Phone, 
  DollarSign, 
  Building2, 
  User, 
  MoreHorizontal,
  MessageSquare,
  Calendar,
  GripVertical
} from "lucide-react";
import { useFormattedCurrency } from "@/hooks/useFormattedCurrency";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  client_type?: string;
  company_name?: string;
  funnel_stage?: string;
  deal_value?: number;
  last_activity_date?: string;
  lead_score?: number;
  follow_up_date?: string;
}

interface KanbanPipelineBoardProps {
  onClientClick?: (clientId: string) => void;
}

// Draggable client card component
const DraggableClientCard = ({ 
  client, 
  onClientClick, 
  formatCurrency 
}: { 
  client: Client; 
  onClientClick?: (clientId: string) => void;
  formatCurrency: (value: number) => string;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: client.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const displayName = client.client_type === 'B2B' ? client.company_name : client.name;
  const initials = displayName?.substring(0, 2).toUpperCase() || 'CL';
  
  // Check if follow-up is overdue
  const isOverdue = client.follow_up_date && new Date(client.follow_up_date) < new Date();
  const isToday = client.follow_up_date && 
    new Date(client.follow_up_date).toDateString() === new Date().toDateString();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group p-3 rounded-lg border bg-card hover:bg-accent/5 cursor-pointer transition-all shadow-sm hover:shadow-md",
        isDragging && "ring-2 ring-primary shadow-lg",
        isOverdue && "border-l-4 border-l-destructive",
        isToday && "border-l-4 border-l-yellow-500"
      )}
      onClick={() => onClientClick?.(client.id)}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <div 
          {...attributes} 
          {...listeners}
          className="flex-shrink-0 text-muted-foreground/50 hover:text-muted-foreground cursor-grab active:cursor-grabbing mt-0.5"
        >
          <GripVertical className="h-4 w-4" />
        </div>
        
        {/* Client info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {client.client_type === 'B2B' ? (
              <Building2 className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
            ) : (
              <User className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            )}
            <span className="text-sm font-medium truncate">
              {displayName}
            </span>
          </div>
          
          {/* Deal value */}
          {client.deal_value && client.deal_value > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5">
              <DollarSign className="h-3 w-3 text-green-600" />
              <span className="font-medium text-foreground">
                {formatCurrency(client.deal_value)}
              </span>
            </div>
          )}
          
          {/* Last activity */}
          {client.last_activity_date && (
            <div className="text-xs text-muted-foreground truncate">
              {formatDistanceToNow(new Date(client.last_activity_date), { addSuffix: true })}
            </div>
          )}
          
          {/* Follow-up indicator */}
          {(isOverdue || isToday) && (
            <div className={cn(
              "text-xs mt-1.5 flex items-center gap-1",
              isOverdue ? "text-destructive" : "text-yellow-600"
            )}>
              <Calendar className="h-3 w-3" />
              {isOverdue ? "Overdue" : "Today"}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {client.email && (
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                window.location.href = `mailto:${client.email}`;
              }}>
                <Mail className="h-3.5 w-3.5 mr-2" />
                Email
              </DropdownMenuItem>
            )}
            {client.phone && (
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                window.location.href = `tel:${client.phone}`;
              }}>
                <Phone className="h-3.5 w-3.5 mr-2" />
                Call
              </DropdownMenuItem>
            )}
            {client.phone && (
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                window.open(`https://wa.me/${client.phone.replace(/\D/g, '')}`, '_blank');
              }}>
                <MessageSquare className="h-3.5 w-3.5 mr-2" />
                WhatsApp
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

// Static card for drag overlay
const ClientCardOverlay = ({ 
  client, 
  formatCurrency 
}: { 
  client: Client; 
  formatCurrency: (value: number) => string;
}) => {
  const displayName = client.client_type === 'B2B' ? client.company_name : client.name;
  
  return (
    <div className="p-3 rounded-lg border bg-card shadow-xl ring-2 ring-primary w-[200px]">
      <div className="flex items-center gap-2">
        {client.client_type === 'B2B' ? (
          <Building2 className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
        ) : (
          <User className="h-3.5 w-3.5 text-primary flex-shrink-0" />
        )}
        <span className="text-sm font-medium truncate">
          {displayName}
        </span>
      </div>
      {client.deal_value && client.deal_value > 0 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          <DollarSign className="h-3 w-3 text-green-600" />
          <span className="font-medium text-foreground">
            {formatCurrency(client.deal_value)}
          </span>
        </div>
      )}
    </div>
  );
};

export const KanbanPipelineBoard = ({ onClientClick }: KanbanPipelineBoardProps) => {
  const { data: allClients } = useClients();
  const updateClient = useUpdateClient();
  const { formatCurrency } = useFormattedCurrency();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Filter out 'lost' from main pipeline - show separately
  const pipelineStages = FUNNEL_STAGES.filter(s => s.value !== 'lost');

  // Group clients by stage
  const clientsByStage = useMemo(() => {
    const grouped: Record<string, Client[]> = {};
    pipelineStages.forEach(stage => {
      grouped[stage.value] = allClients?.filter(c => c.funnel_stage === stage.value) || [];
    });
    return grouped;
  }, [allClients, pipelineStages]);

  // Calculate stage values
  const getStageValue = (stage: string) => {
    const clients = clientsByStage[stage] || [];
    return clients.reduce((sum, c) => sum + (c.deal_value || 0), 0);
  };

  // Get active client for drag overlay
  const activeClient = useMemo(() => {
    if (!activeId) return null;
    return allClients?.find(c => c.id === activeId) || null;
  }, [activeId, allClients]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const clientId = active.id as string;
    const newStage = over.id as string;

    // Find the client and check if stage changed
    const client = allClients?.find(c => c.id === clientId);
    if (!client || client.funnel_stage === newStage) return;

    // Update client stage
    try {
      await updateClient.mutateAsync({
        id: clientId,
        funnel_stage: newStage,
        stage_changed_at: new Date().toISOString(),
      });
      
      const stageName = FUNNEL_STAGES.find(s => s.value === newStage)?.label || newStage;
      toast.success(`Moved to ${stageName}`);
    } catch (error) {
      toast.error("Failed to update client stage");
    }
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Card className="border-0 shadow-none bg-transparent">
        <CardContent className="p-0">
          <div className="flex gap-3 overflow-x-auto pb-4">
            {pipelineStages.map((stage) => {
              const clients = clientsByStage[stage.value];
              const stageValue = getStageValue(stage.value);

              return (
                <StageColumn
                  key={stage.value}
                  stage={stage}
                  clients={clients}
                  stageValue={stageValue}
                  onClientClick={onClientClick}
                  formatCurrency={formatCurrency}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Drag overlay */}
      <DragOverlay>
        {activeClient && (
          <ClientCardOverlay client={activeClient} formatCurrency={formatCurrency} />
        )}
      </DragOverlay>
    </DndContext>
  );
};

// Stage column as droppable area
const StageColumn = ({
  stage,
  clients,
  stageValue,
  onClientClick,
  formatCurrency,
}: {
  stage: typeof FUNNEL_STAGES[number];
  clients: Client[];
  stageValue: number;
  onClientClick?: (clientId: string) => void;
  formatCurrency: (value: number) => string;
}) => {
  const { setNodeRef, isOver } = useSortable({ 
    id: stage.value,
    data: { type: 'column' }
  });

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "min-w-[220px] rounded-lg transition-colors",
        isOver && "bg-primary/5 ring-2 ring-primary/20"
      )}
    >
      {/* Stage header */}
      <div className="mb-3">
        <Badge 
          variant="outline" 
          className={cn("justify-center w-full py-1.5", stage.color)}
        >
          {stage.label}
        </Badge>
        <div className="text-center mt-2">
          <p className="text-sm font-semibold">{clients.length}</p>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(stageValue)}
          </p>
        </div>
      </div>

      {/* Client cards */}
      <ScrollArea className="h-[calc(100vh-320px)] min-h-[300px]">
        <div className="space-y-2 pr-2">
          {clients.map((client) => (
            <DraggableClientCard
              key={client.id}
              client={client}
              onClientClick={onClientClick}
              formatCurrency={formatCurrency}
            />
          ))}
          {clients.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-xs">No clients</div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
