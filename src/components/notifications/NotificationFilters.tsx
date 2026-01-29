import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "all", label: "All", icon: "📋" },
  { value: "project", label: "Projects", icon: "📁" },
  { value: "appointment", label: "Appointments", icon: "📅" },
  { value: "quote", label: "Quotes", icon: "📄" },
  { value: "team", label: "Team", icon: "👥" },
  { value: "system", label: "System", icon: "⚙️" },
];

const PRIORITIES = [
  { value: "all", label: "All Priorities" },
  { value: "high", label: "High Priority" },
  { value: "normal", label: "Normal" },
  { value: "low", label: "Low Priority" },
];

interface NotificationFiltersProps {
  category: string;
  priority: string;
  search: string;
  showUnreadOnly: boolean;
  onCategoryChange: (category: string) => void;
  onPriorityChange: (priority: string) => void;
  onSearchChange: (search: string) => void;
  onUnreadOnlyChange: (unreadOnly: boolean) => void;
}

export const NotificationFilters = ({
  category,
  priority,
  search,
  showUnreadOnly,
  onCategoryChange,
  onPriorityChange,
  onSearchChange,
  onUnreadOnlyChange,
}: NotificationFiltersProps) => {
  return (
    <div className="space-y-4">
      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.value}
            variant={category === cat.value ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(cat.value)}
            className={cn(
              "gap-1.5 transition-all",
              category === cat.value && "ring-2 ring-primary/20"
            )}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </Button>
        ))}
      </div>

      {/* Search and Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={priority} onValueChange={onPriorityChange}>
          <SelectTrigger className="w-[160px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            {PRIORITIES.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={showUnreadOnly ? "default" : "outline"}
          size="sm"
          onClick={() => onUnreadOnlyChange(!showUnreadOnly)}
          className="gap-2"
        >
          {showUnreadOnly && <Badge variant="secondary" className="h-5 px-1.5">✓</Badge>}
          Unread only
        </Button>
      </div>
    </div>
  );
};
