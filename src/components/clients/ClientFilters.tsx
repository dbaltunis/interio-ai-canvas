
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
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

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search clients by name or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Client Type Filter */}
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

          {/* Filter Dialog */}
          <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Filter Clients</DialogTitle>
                <DialogDescription>
                  Filter clients by project status and associated projects
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Project Status Filter */}
                <div>
                  <h4 className="font-medium mb-3">Project Status</h4>
                  <div className="space-y-2">
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
                    <h4 className="font-medium mb-3">Associated Projects</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
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

                {/* Clear Filters */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={onClearFilters}
                    disabled={activeFiltersCount === 0}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                  <Button onClick={() => setIsFilterOpen(false)}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {clientType !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {clientType}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setClientType('all')}
                />
              </Badge>
            )}
            {selectedStatuses.map((status) => (
              <Badge key={status} variant="secondary" className="flex items-center gap-1">
                {projectStatuses.find(s => s.value === status)?.label}
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
                  {project.name}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleProjectToggle(projectId)}
                  />
                </Badge>
              ) : null;
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
