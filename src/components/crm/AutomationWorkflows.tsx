import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAutomationWorkflows } from "@/hooks/useMarketing";
import { Play, Pause, Settings, BarChart3 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const AutomationWorkflows = () => {
  const { data: workflows, isLoading } = useAutomationWorkflows();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Automation Workflows
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading workflows...</div>
        </CardContent>
      </Card>
    );
  }

  if (!workflows?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Automation Workflows
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground space-y-2">
            <div>No automation workflows configured yet</div>
            <Button size="sm">Create Your First Workflow</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Automation Workflows ({workflows.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {workflows.map((workflow) => (
          <WorkflowCard key={workflow.id} workflow={workflow} />
        ))}
      </CardContent>
    </Card>
  );
};

interface WorkflowCardProps {
  workflow: any;
}

const WorkflowCard = ({ workflow }: WorkflowCardProps) => {
  const getTriggerLabel = (triggerEvent: string) => {
    const labels: Record<string, string> = {
      'lead_created': 'New Lead Created',
      'stage_change': 'Stage Changed',
      'deal_created': 'New Deal Created',
      'deal_stage_change': 'Deal Stage Changed',
      'time_based': 'Time-Based',
      'behavior': 'Behavior Triggered'
    };
    return labels[triggerEvent] || triggerEvent;
  };

  const getActionCount = () => {
    try {
      const actions = JSON.parse(workflow.actions || '[]');
      return Array.isArray(actions) ? actions.length : 0;
    } catch {
      return 0;
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium">{workflow.name}</h4>
            <Badge variant={workflow.is_active ? "default" : "secondary"}>
              {workflow.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          {workflow.description && (
            <p className="text-sm text-muted-foreground mb-2">{workflow.description}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Trigger: {getTriggerLabel(workflow.trigger_event)}</span>
            <span>Actions: {getActionCount()}</span>
            <span>Executed: {workflow.execution_count} times</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            <BarChart3 className="h-3 w-3 mr-1" />
            Stats
          </Button>
          <Button size="sm" variant="outline">
            {workflow.is_active ? (
              <>
                <Pause className="h-3 w-3 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-3 w-3 mr-1" />
                Start
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground">
        Created {formatDistanceToNow(new Date(workflow.created_at), { addSuffix: true })}
        {workflow.updated_at !== workflow.created_at && (
          <span> • Updated {formatDistanceToNow(new Date(workflow.updated_at), { addSuffix: true })}</span>
        )}
      </div>
    </div>
  );
};