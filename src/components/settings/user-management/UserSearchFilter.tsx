import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";

interface UserSearchFilterProps {
  onSearchChange: (search: string) => void;
  onRoleFilter: (role: string | null) => void;
  onStatusFilter: (status: string | null) => void;
  activeFilters: {
    search: string;
    role: string | null;
    status: string | null;
  };
}

export const UserSearchFilter = ({ 
  onSearchChange, 
  onRoleFilter, 
  onStatusFilter, 
  activeFilters 
}: UserSearchFilterProps) => {
  const clearAllFilters = () => {
    onSearchChange("");
    onRoleFilter(null);
    onStatusFilter(null);
  };

  const hasActiveFilters = activeFilters.search || activeFilters.role || activeFilters.status;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            value={activeFilters.search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={activeFilters.role || ""} onValueChange={(value) => onRoleFilter(value || null)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Roles</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Manager">Manager</SelectItem>
              <SelectItem value="Staff">Staff</SelectItem>
            </SelectContent>
          </Select>

          <Select value={activeFilters.status || ""} onValueChange={(value) => onStatusFilter(value || null)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: {activeFilters.search}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onSearchChange("")}
              />
            </Badge>
          )}
          {activeFilters.role && (
            <Badge variant="secondary" className="gap-1">
              Role: {activeFilters.role}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onRoleFilter(null)}
              />
            </Badge>
          )}
          {activeFilters.status && (
            <Badge variant="secondary" className="gap-1">
              Status: {activeFilters.status}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onStatusFilter(null)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};