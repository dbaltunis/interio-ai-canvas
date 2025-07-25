import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, Search, X } from "lucide-react";
import { useTeamMembers } from "@/hooks/useTeamMembers";

interface CalendarFiltersProps {
  onFiltersChange: (filters: CalendarFilterState) => void;
}

export interface CalendarFilterState {
  searchTerm: string;
  userIds: string[];
  eventTypes: string[];
  statuses: string[];
}

const eventTypes = [
  { id: 'meeting', label: 'Meeting' },
  { id: 'consultation', label: 'Consultation' },
  { id: 'call', label: 'Call' },
  { id: 'follow-up', label: 'Follow-up' }
];

const statuses = [
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'rescheduled', label: 'Rescheduled' }
];

export const CalendarFilters = ({ onFiltersChange }: CalendarFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<CalendarFilterState>({
    searchTerm: "",
    userIds: [],
    eventTypes: [],
    statuses: []
  });

  const { data: teamMembers } = useTeamMembers();

  const updateFilters = (newFilters: Partial<CalendarFilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      searchTerm: "",
      userIds: [],
      eventTypes: [],
      statuses: []
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = filters.searchTerm || 
    filters.userIds.length > 0 || 
    filters.eventTypes.length > 0 || 
    filters.statuses.length > 0;

  const handleUserToggle = (userId: string) => {
    const newUserIds = filters.userIds.includes(userId)
      ? filters.userIds.filter(id => id !== userId)
      : [...filters.userIds, userId];
    updateFilters({ userIds: newUserIds });
  };

  const handleEventTypeToggle = (eventType: string) => {
    const newEventTypes = filters.eventTypes.includes(eventType)
      ? filters.eventTypes.filter(type => type !== eventType)
      : [...filters.eventTypes, eventType];
    updateFilters({ eventTypes: newEventTypes });
  };

  const handleStatusToggle = (status: string) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    updateFilters({ statuses: newStatuses });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={`relative ${hasActiveFilters ? 'border-primary bg-primary/5' : ''}`}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Filter Events</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by event name, client..."
                value={filters.searchTerm}
                onChange={(e) => updateFilters({ searchTerm: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          {/* Team Members Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Team Members</label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {teamMembers?.map(member => (
                <div key={member.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`user-${member.id}`}
                    checked={filters.userIds.includes(member.id)}
                    onCheckedChange={() => handleUserToggle(member.id)}
                  />
                  <label
                    htmlFor={`user-${member.id}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {member.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Event Types Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Event Types</label>
            <div className="space-y-2">
              {eventTypes.map(type => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type.id}`}
                    checked={filters.eventTypes.includes(type.id)}
                    onCheckedChange={() => handleEventTypeToggle(type.id)}
                  />
                  <label
                    htmlFor={`type-${type.id}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {type.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <div className="space-y-2">
              {statuses.map(status => (
                <div key={status.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status.id}`}
                    checked={filters.statuses.includes(status.id)}
                    onCheckedChange={() => handleStatusToggle(status.id)}
                  />
                  <label
                    htmlFor={`status-${status.id}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {status.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};