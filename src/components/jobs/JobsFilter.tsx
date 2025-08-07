
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useJobStatuses } from "@/hooks/useJobStatuses";
import { Filter, Search, X } from "lucide-react";

interface JobsFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  onClearFilters: () => void;
}

export const JobsFilter = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onClearFilters
}: JobsFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: jobStatuses = [] } = useJobStatuses();
  
  const hasActiveFilters = searchTerm || statusFilter !== "all";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline"
          className="p-2 relative"
          title="Filters"
        >
          <Filter className="h-4 w-4" />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 bg-brand-primary text-white rounded-full text-xs px-1.5 py-0.5">
              {(searchTerm ? 1 : 0) + (statusFilter !== "all" ? 1 : 0)}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filter Jobs</h4>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={onClearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search jobs, clients, or job numbers..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={onStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {jobStatuses.map(status => (
                    <SelectItem key={status.id} value={status.name.toLowerCase()}>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full bg-${status.color}-500`} />
                        <span>{status.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
