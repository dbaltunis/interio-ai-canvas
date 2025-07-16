
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, LayoutGrid, List, Calendar, Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JobsHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  onNewJob: () => void;
  jobsCount: number;
}

export const JobsHeader = ({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  onNewJob,
  jobsCount
}: JobsHeaderProps) => {
  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary">Jobs Management</h1>
          <p className="text-gray-600 mt-1">{jobsCount} jobs found</p>
        </div>
        <Button 
          onClick={onNewJob}
          className="bg-brand-primary hover:bg-brand-accent text-white px-6 py-2 font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Job
        </Button>
      </div>

      {/* Search and Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search jobs, clients, or job numbers..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 border-gray-300 focus:border-brand-primary focus:ring-brand-primary"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Sort */}
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-40 border-gray-300">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date_created">Date Created</SelectItem>
              <SelectItem value="job_number">Job Number</SelectItem>
              <SelectItem value="client_name">Client Name</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="value">Value</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-gray-300 rounded-lg">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className={`rounded-r-none border-r ${
                viewMode === "list" 
                  ? "bg-brand-primary text-white hover:bg-brand-accent" 
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className={`rounded-l-none ${
                viewMode === "grid" 
                  ? "bg-brand-primary text-white hover:bg-brand-accent" 
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>

          {/* Export */}
          <Button variant="outline" size="sm" className="border-gray-300 text-gray-600 hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
    </div>
  );
};
