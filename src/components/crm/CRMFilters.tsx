import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface CRMFiltersProps {
  filters: {
    stage: string;
    source: string;
    dateRange: string;
    minDealValue: string;
    maxDealValue: string;
    assignedTo: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onReset: () => void;
}

export const CRMFilters = ({ filters, onFilterChange, onReset }: CRMFiltersProps) => {
  const hasActiveFilters = Object.values(filters).some(v => v !== "all" && v !== "");

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <div className="space-y-2">
            <Label htmlFor="stage">Stage</Label>
            <Select value={filters.stage} onValueChange={(v) => onFilterChange("stage", v)}>
              <SelectTrigger id="stage">
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="measuring_scheduled">Measuring Scheduled</SelectItem>
                <SelectItem value="quoted">Quoted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Select value={filters.source} onValueChange={(v) => onFilterChange("source", v)}>
              <SelectTrigger id="source">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="social_media">Social Media</SelectItem>
                <SelectItem value="advertisement">Advertisement</SelectItem>
                <SelectItem value="direct">Direct</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateRange">Date Range</Label>
            <Select value={filters.dateRange} onValueChange={(v) => onFilterChange("dateRange", v)}>
              <SelectTrigger id="dateRange">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minDealValue">Min Deal Value</Label>
            <Input
              id="minDealValue"
              type="number"
              placeholder="$0"
              value={filters.minDealValue}
              onChange={(e) => onFilterChange("minDealValue", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxDealValue">Max Deal Value</Label>
            <Input
              id="maxDealValue"
              type="number"
              placeholder="$50,000+"
              value={filters.maxDealValue}
              onChange={(e) => onFilterChange("maxDealValue", e.target.value)}
            />
          </div>

          <div className="flex items-end">
            {hasActiveFilters && (
              <Button variant="outline" onClick={onReset} className="w-full">
                <X className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};