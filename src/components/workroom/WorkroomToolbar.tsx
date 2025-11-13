import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Printer, Eye, X, ChevronDown, Filter, Layout, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface WorkroomToolbarProps {
  selectedTemplate: string;
  onTemplateChange: (value: string) => void;
  groupByRoom: boolean;
  onToggleGroupBy: () => void;
  onPrint: () => void;
  onPreview: () => void;
  onDownloadPDF: () => void;
  isGenerating?: boolean;
  
  // Layout controls
  orientation: 'portrait' | 'landscape';
  onOrientationChange: (orientation: 'portrait' | 'landscape') => void;
  margins: number;
  onMarginsChange: (margins: number) => void;
  
  // Filtering
  selectedRoom?: string;
  onRoomChange: (room: string) => void;
  selectedTreatment?: string;
  onTreatmentChange: (treatment: string) => void;
  availableRooms: string[];
  availableTreatments: string[];
  activeFiltersCount: number;
  onClearFilters: () => void;
}

interface Template {
  id: string;
  name: string;
  template_style: string;
}

export const WorkroomToolbar: React.FC<WorkroomToolbarProps> = ({
  selectedTemplate,
  onTemplateChange,
  groupByRoom,
  onToggleGroupBy,
  onPrint,
  onPreview,
  onDownloadPDF,
  isGenerating = false,
  orientation,
  onOrientationChange,
  margins,
  onMarginsChange,
  selectedRoom,
  onRoomChange,
  selectedTreatment,
  onTreatmentChange,
  availableRooms,
  availableTreatments,
  activeFiltersCount,
  onClearFilters,
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('quote_templates')
        .select('id, name, template_style')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMarginLabel = () => {
    if (margins === 5) return 'Narrow';
    if (margins === 12) return 'Wide';
    return 'Normal';
  };

  return (
    <Card className="no-print p-3">
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        {/* Document Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={loading} className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Document</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 bg-background z-50">
            <DropdownMenuLabel>Work Orders</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onTemplateChange('workshop-info')}>
              Work Order 1
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground cursor-not-allowed">
              Installation
            </DropdownMenuLabel>
            <DropdownMenuLabel className="text-xs text-muted-foreground cursor-not-allowed">
              Fitting
            </DropdownMenuLabel>
            
            {templates.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Custom Templates</DropdownMenuLabel>
                {templates.map((template) => (
                  <DropdownMenuItem
                    key={template.id}
                    onClick={() => onTemplateChange(template.id)}
                  >
                    {template.name}
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Filter Button with Popover */}
        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 relative">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="default" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-background z-50" align="start">
            <div className="space-y-4">
              <div className="font-medium text-sm flex items-center justify-between">
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onClearFilters();
                      setFiltersOpen(false);
                    }}
                    className="h-7 px-2 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear all
                  </Button>
                )}
              </div>
              
              {/* Room Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Room</label>
                <select
                  value={selectedRoom || 'all'}
                  onChange={(e) => onRoomChange(e.target.value)}
                  className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="all">All Rooms</option>
                  {availableRooms.map((room) => (
                    <option key={room} value={room}>
                      {room}
                    </option>
                  ))}
                </select>
              </div>

              {/* Treatment Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Treatment</label>
                <select
                  value={selectedTreatment || 'all'}
                  onChange={(e) => onTreatmentChange(e.target.value)}
                  className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="all">All Treatments</option>
                  {availableTreatments.map((treatment) => (
                    <option key={treatment} value={treatment}>
                      {treatment}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Layout Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Layout className="h-4 w-4" />
              <span className="hidden sm:inline">{orientation === 'portrait' ? 'Portrait' : 'Landscape'}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-background z-50">
            <DropdownMenuLabel>Page Orientation</DropdownMenuLabel>
            <DropdownMenuItem 
              onClick={() => onOrientationChange('portrait')}
              className={orientation === 'portrait' ? 'bg-accent' : ''}
            >
              Portrait
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onOrientationChange('landscape')}
              className={orientation === 'landscape' ? 'bg-accent' : ''}
            >
              Landscape
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Margins Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <span className="hidden sm:inline">Margins:</span>
              <span>{getMarginLabel()}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-background z-50">
            <DropdownMenuLabel>Page Margins</DropdownMenuLabel>
            <DropdownMenuItem 
              onClick={() => onMarginsChange(5)}
              className={margins === 5 ? 'bg-accent' : ''}
            >
              Narrow (5mm)
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onMarginsChange(8)}
              className={margins === 8 ? 'bg-accent' : ''}
            >
              Normal (8mm)
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onMarginsChange(12)}
              className={margins === 12 ? 'bg-accent' : ''}
            >
              Wide (12mm)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Spacer to push action buttons to the right on desktop */}
        <div className="flex-1 hidden md:block" />

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-auto md:ml-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onPreview}
            className="gap-2"
            aria-label="Preview document"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden lg:inline">Preview</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onPrint} 
            className="gap-2"
            aria-label="Print document"
            disabled={isGenerating}
          >
            <Printer className="h-4 w-4" />
            <span className="hidden lg:inline">Print</span>
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={onDownloadPDF}
            disabled={isGenerating}
            className="gap-2"
            aria-label="Download as PDF"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">{isGenerating ? 'Generating...' : 'PDF'}</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};
