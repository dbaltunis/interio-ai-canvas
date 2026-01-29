import React, { useState } from 'react';
import { useProjectActivityLog, ProjectActivityType } from '@/hooks/useProjectActivityLog';
import { useStatusHistory } from '@/hooks/useStatusHistory';
import { format } from 'date-fns';
import { 
  Activity, 
  UserPlus, 
  UserMinus, 
  Mail, 
  FileText, 
  Send, 
  StickyNote, 
  Link, 
  Plus, 
  Copy,
  ArrowRightLeft,
  Filter
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectActivityTabProps {
  projectId: string;
}

const activityIcons: Record<ProjectActivityType | 'status_changed_legacy', React.ElementType> = {
  status_changed: ArrowRightLeft,
  status_changed_legacy: ArrowRightLeft,
  team_assigned: UserPlus,
  team_removed: UserMinus,
  email_sent: Mail,
  quote_created: FileText,
  quote_sent: Send,
  note_added: StickyNote,
  client_linked: Link,
  project_created: Plus,
  project_duplicated: Copy,
};

const activityColors: Record<ProjectActivityType | 'status_changed_legacy', string> = {
  status_changed: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  status_changed_legacy: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  team_assigned: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  team_removed: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  email_sent: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  quote_created: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
  quote_sent: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
  note_added: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  client_linked: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
  project_created: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  project_duplicated: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
};

const activityLabels: Record<ProjectActivityType | 'status_changed_legacy', string> = {
  status_changed: 'Status',
  status_changed_legacy: 'Status',
  team_assigned: 'Team',
  team_removed: 'Team',
  email_sent: 'Email',
  quote_created: 'Quote',
  quote_sent: 'Quote',
  note_added: 'Note',
  client_linked: 'Client',
  project_created: 'Created',
  project_duplicated: 'Duplicated',
};

type FilterType = 'all' | 'status' | 'team' | 'emails' | 'quotes' | 'other';

export const ProjectActivityTab = ({ projectId }: ProjectActivityTabProps) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const { data: activities, isLoading: activitiesLoading } = useProjectActivityLog(projectId);
  const { data: statusHistory, isLoading: statusLoading } = useStatusHistory(projectId);

  const isLoading = activitiesLoading || statusLoading;

  // Combine activities with status history
  const combinedActivities = React.useMemo(() => {
    const allActivities: Array<{
      id: string;
      type: ProjectActivityType | 'status_changed_legacy';
      title: string;
      description: string | null;
      user_name: string;
      created_at: string;
      metadata?: Record<string, any> | null;
    }> = [];

    // Add project activities
    if (activities) {
      activities.forEach(activity => {
        allActivities.push({
          id: activity.id,
          type: activity.activity_type,
          title: activity.title,
          description: activity.description,
          user_name: activity.user_name || 'Unknown',
          created_at: activity.created_at,
          metadata: activity.metadata,
        });
      });
    }

    // Add status history (existing status changes that weren't logged via new system)
    if (statusHistory) {
      statusHistory.forEach(change => {
        // Check if this status change is already in activities (to avoid duplicates)
        const alreadyExists = activities?.some(
          a => a.activity_type === 'status_changed' && 
               a.metadata?.status_change_id === change.id
        );
        
        if (!alreadyExists) {
          allActivities.push({
            id: `status-${change.id}`,
            type: 'status_changed_legacy',
            title: `Status changed from "${change.previous_status_name || 'None'}" to "${change.new_status_name}"`,
            description: change.reason || change.notes || null,
            user_name: change.user_name || change.user_email || 'Unknown',
            created_at: change.changed_at,
            metadata: {
              previous_status: change.previous_status_name,
              new_status: change.new_status_name,
              reason: change.reason,
            },
          });
        }
      });
    }

    // Sort by date descending
    allActivities.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return allActivities;
  }, [activities, statusHistory]);

  // Filter activities
  const filteredActivities = React.useMemo(() => {
    if (filter === 'all') return combinedActivities;
    
    return combinedActivities.filter(activity => {
      switch (filter) {
        case 'status':
          return activity.type === 'status_changed' || activity.type === 'status_changed_legacy';
        case 'team':
          return activity.type === 'team_assigned' || activity.type === 'team_removed';
        case 'emails':
          return activity.type === 'email_sent' || activity.type === 'quote_sent';
        case 'quotes':
          return activity.type === 'quote_created' || activity.type === 'quote_sent';
        case 'other':
          return !['status_changed', 'status_changed_legacy', 'team_assigned', 'team_removed', 'email_sent', 'quote_sent', 'quote_created'].includes(activity.type);
        default:
          return true;
      }
    });
  }, [combinedActivities, filter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Activity Log</h3>
          <Badge variant="secondary" className="ml-2">
            {filteredActivities.length}
          </Badge>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              {filter === 'all' ? 'All Activities' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem
              checked={filter === 'all'}
              onCheckedChange={() => setFilter('all')}
            >
              All Activities
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filter === 'status'}
              onCheckedChange={() => setFilter('status')}
            >
              Status Changes
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filter === 'team'}
              onCheckedChange={() => setFilter('team')}
            >
              Team Changes
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filter === 'emails'}
              onCheckedChange={() => setFilter('emails')}
            >
              Emails
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filter === 'quotes'}
              onCheckedChange={() => setFilter('quotes')}
            >
              Quotes
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filter === 'other'}
              onCheckedChange={() => setFilter('other')}
            >
              Other
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Timeline */}
      <ScrollArea className="h-[500px] pr-4">
        {filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Activity className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No activity recorded yet</p>
            <p className="text-sm text-muted-foreground/70">
              Activities will appear here as changes are made to this project
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

            <div className="space-y-4">
              {filteredActivities.map((activity, index) => {
                const Icon = activityIcons[activity.type] || Activity;
                const colorClass = activityColors[activity.type] || 'bg-gray-100 text-gray-600';
                const label = activityLabels[activity.type] || 'Activity';

                return (
                  <div key={activity.id} className="relative flex gap-4 pl-2">
                    {/* Icon */}
                    <div className={cn(
                      "relative z-10 flex h-8 w-8 items-center justify-center rounded-full",
                      colorClass
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pb-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {label}
                            </Badge>
                            <span className="text-sm font-medium text-foreground">
                              {activity.user_name}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-foreground">
                            {activity.title}
                          </p>
                          {activity.description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                          )}
                        </div>
                        <time className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(activity.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </time>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
