
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, List, Download } from "lucide-react";

interface JobsHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
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
    <div className="space-y-6">
      {/* Main Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary">Jobs Management</h1>
          <p className="text-gray-600 mt-1">{jobsCount} jobs found</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
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

        {/* Export Button */}
        <Button variant="outline" size="sm" className="border-gray-300 text-gray-600 hover:bg-gray-50">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
};
