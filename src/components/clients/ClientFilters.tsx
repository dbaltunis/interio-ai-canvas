
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Filter, X } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";

interface ClientFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedStatuses: string[];
  setSelectedStatuses: (statuses: string[]) => void;
  selectedProjects: string[];
  setSelectedProjects: (projects: string[]) => void;
  clientType: string;
  setClientType: (type: string) => void;
  onClearFilters: () => void;
}

export const ClientFilters = ({
  searchTerm,
  setSearchTerm,
  selectedStatuses,
  setSelectedStatuses,
  selectedProjects,
  setSelectedProjects,
  clientType,
  setClientType,
  onClearFilters
}: ClientFiltersProps) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const { data: projects } = useProjects();

  const projectStatuses = [
    { value: 'planning', label: 'Planning' },
    { value: 'measuring', label: 'Measuring' },
    { value: 'quoted', label: 'Quoted' },
    { value: 'approved', label: 'Approved' },
    { value: 'in-production', label: 'In Production' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const handleStatusToggle = (status: string) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter(s => s !== status));
    } else {
      setSelectedStatuses([...selectedStatuses, status]);
    }
  };

  const handleProjectToggle = (projectId: string) => {
    if (selectedProjects.includes(projectId)) {
      setSelectedProjects(selectedProjects.filter(p => p !== projectId));
    } else {
      setSelectedProjects([...selectedProjects, projectId]);
    }
  };

  const activeFiltersCount = selectedStatuses.length + selectedProjects.length + (clientType !== 'all' ? 1 : 0);
  const hasActiveFilters = searchTerm || activeFiltersCount > 0;

  const clearFilters = () => {
    onClearFilters();
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search clients by name or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={clientType} onValueChange={setClientType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Client Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="B2B">B2B Clients</SelectItem>
            <SelectItem value="B2C">B2C Clients</SelectItem>
          </SelectContent>
        </Select>

        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-primary text-primary-foreground rounded-full text-xs px-2 py-0.5 ml-1">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filter Clients</h4>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
              
              <div className="space-y-3">
                {/* Project Status Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Project Status</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {projectStatuses.map((status) => (
                      <div key={status.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={status.value}
                          checked={selectedStatuses.includes(status.value)}
                          onCheckedChange={() => handleStatusToggle(status.value)}
                        />
                        <label
                          htmlFor={status.value}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {status.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projects Filter */}
                {projects && projects.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Associated Projects</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {projects.map((project) => (
                        <div key={project.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={project.id}
                            checked={selectedProjects.includes(project.id)}
                            onCheckedChange={() => handleProjectToggle(project.id)}
                          />
                          <label
                            htmlFor={project.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {project.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Results Info */}
      {hasActiveFilters && (
        <div className="text-sm text-muted-foreground">
          {searchTerm && (
            <span>Search: "{searchTerm}" • </span>
          )}
          {activeFiltersCount > 0 && (
            <span>{activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} applied</span>
          )}
        </div>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {clientType !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Type: {clientType}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setClientType('all')}
              />
            </Badge>
          )}
          {selectedStatuses.map((status) => (
            <Badge key={status} variant="secondary" className="flex items-center gap-1">
              Status: {projectStatuses.find(s => s.value === status)?.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleStatusToggle(status)}
              />
            </Badge>
          ))}
          {selectedProjects.map((projectId) => {
            const project = projects?.find(p => p.id === projectId);
            return project ? (
              <Badge key={projectId} variant="secondary" className="flex items-center gap-1">
                Project: {project.name}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleProjectToggle(projectId)}
                />
              </Badge>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
};
