
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Grid3X3, List, Plus, Download, SlidersHorizontal } from "lucide-react";

interface JobsHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  onNewJob: () => void;
  jobsCount: number;
  showFilters: boolean;
  onToggleFilters: () => void;
}

export const JobsHeader = ({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  onNewJob,
  jobsCount,
  showFilters,
  onToggleFilters
}: JobsHeaderProps) => {
  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search jobs, clients, or job numbers..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFilters}
            className={`flex items-center space-x-2 ${showFilters ? 'bg-brand-primary text-white' : ''}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
            {showFilters && <Badge variant="secondary" className="ml-2 bg-white text-brand-primary">Active</Badge>}
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date_created">Date Created (Newest)</SelectItem>
              <SelectItem value="job_number">Job Number</SelectItem>
              <SelectItem value="client_name">Client Name</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="value">Value (Highest)</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border border-gray-200 rounded-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChange('list')}
              className={`rounded-r-none ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className={`rounded-l-none border-l ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button 
            onClick={onNewJob}
            className="bg-brand-primary hover:bg-brand-accent text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Job
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
        <span>
          Showing {jobsCount} {jobsCount === 1 ? 'job' : 'jobs'}
          {searchTerm && ` matching "${searchTerm}"`}
        </span>
        <div className="flex items-center space-x-4">
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};
