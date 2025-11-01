import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Eye, Building2, Users, Lock } from "lucide-react";
import { useCalendarPreferences, useUpdateCalendarPreferences } from "@/hooks/useCalendarPreferences";

export const CalendarVisibilityFilter = () => {
  const { data: preferences } = useCalendarPreferences();
  const updatePreferences = useUpdateCalendarPreferences();

  const activeFilters = [
    preferences?.show_organization_events && 'Organization',
    preferences?.show_team_events && 'Team',
    preferences?.show_personal_events && 'Personal'
  ].filter(Boolean);

  const handleToggle = (key: 'show_organization_events' | 'show_team_events' | 'show_personal_events') => {
    updatePreferences.mutate({
      [key]: !preferences?.[key]
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="h-4 w-4" />
          View
          {activeFilters.length < 3 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilters.length}/3
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-3">Calendar Visibility</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Choose which event types to display on your calendar
            </p>
          </div>

          <div className="space-y-4">
            {/* Organization Events */}
            <div className="flex items-center justify-between space-x-3 p-3 rounded-lg border bg-card">
              <div className="flex items-start gap-3 flex-1">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2 mt-0.5">
                  <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <Label
                    htmlFor="organization-events"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Organization Events
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Events shared with entire company
                  </p>
                </div>
              </div>
              <Switch
                id="organization-events"
                checked={preferences?.show_organization_events ?? true}
                onCheckedChange={() => handleToggle('show_organization_events')}
              />
            </div>

            {/* Team Events */}
            <div className="flex items-center justify-between space-x-3 p-3 rounded-lg border bg-card">
              <div className="flex items-start gap-3 flex-1">
                <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-2 mt-0.5">
                  <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <Label
                    htmlFor="team-events"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Team Events
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Events shared with specific team members
                  </p>
                </div>
              </div>
              <Switch
                id="team-events"
                checked={preferences?.show_team_events ?? true}
                onCheckedChange={() => handleToggle('show_team_events')}
              />
            </div>

            {/* Personal Events */}
            <div className="flex items-center justify-between space-x-3 p-3 rounded-lg border bg-card">
              <div className="flex items-start gap-3 flex-1">
                <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-2 mt-0.5">
                  <Lock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <Label
                    htmlFor="personal-events"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Personal Events
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your private calendar events
                  </p>
                </div>
              </div>
              <Switch
                id="personal-events"
                checked={preferences?.show_personal_events ?? true}
                onCheckedChange={() => handleToggle('show_personal_events')}
              />
            </div>
          </div>

          <div className="pt-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                updatePreferences.mutate({
                  show_organization_events: true,
                  show_team_events: true,
                  show_personal_events: true
                });
              }}
              className="w-full"
            >
              Show All
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
