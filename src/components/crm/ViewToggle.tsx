
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutGrid, List, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ViewToggleProps {
  currentView: 'kanban' | 'list';
  onViewChange: (view: 'kanban' | 'list') => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onNewClient: () => void;
}

export const ViewToggle = ({
  currentView,
  onViewChange,
  searchTerm,
  onSearchChange,
  onNewClient
}: ViewToggleProps) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <ToggleGroup
          type="single"
          value={currentView}
          onValueChange={(value) => value && onViewChange(value as 'kanban' | 'list')}
          className="border rounded-lg p-1"
        >
          <ToggleGroupItem 
            value="kanban" 
            aria-label="Kanban view"
            className="data-[state=on]:bg-brand-primary data-[state=on]:text-white"
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Kanban
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="list" 
            aria-label="List view"
            className="data-[state=on]:bg-brand-primary data-[state=on]:text-white"
          >
            <List className="h-4 w-4 mr-2" />
            List
          </ToggleGroupItem>
        </ToggleGroup>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>

      <Button 
        onClick={onNewClient}
        className="bg-brand-primary hover:bg-brand-accent text-white"
      >
        <Search className="w-4 h-4 mr-2" />
        New Client
      </Button>
    </div>
  );
};
