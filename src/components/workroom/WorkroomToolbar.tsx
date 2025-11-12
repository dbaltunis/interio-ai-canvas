import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Printer, Eye, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

  return (
    <Card className="no-print p-3 space-y-3">
      {/* Top Row: Template + Layout Controls */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Document</label>
          <select
            aria-label="Select document type"
            value={selectedTemplate}
            onChange={(e) => onTemplateChange(e.target.value)}
            className="h-9 rounded-md border bg-background px-3 text-sm"
            disabled={loading}
          >
            <option value="workshop-info">Workshop Information (Classic)</option>
            {templates.length > 0 && (
              <optgroup label="Your Custom Templates">
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>

          <div className="flex items-center gap-2 pl-2 border-l">
            <label className="text-sm">Group by room</label>
            <input
              type="checkbox"
              checked={groupByRoom}
              onChange={onToggleGroupBy}
              aria-label="Toggle group by room"
            />
          </div>
        </div>

        {/* Layout Controls */}
        <div className="flex items-center gap-3 border-l pl-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Layout</label>
            <Button
              variant={orientation === 'portrait' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onOrientationChange('portrait')}
              className="h-8"
            >
              Portrait
            </Button>
            <Button
              variant={orientation === 'landscape' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onOrientationChange('landscape')}
              className="h-8"
            >
              Landscape
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Margins</label>
            <select
              value={margins}
              onChange={(e) => onMarginsChange(Number(e.target.value))}
              className="h-8 rounded-md border bg-background px-2 text-sm"
            >
              <option value={5}>Narrow (5mm)</option>
              <option value={8}>Normal (8mm)</option>
              <option value={12}>Wide (12mm)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bottom Row: Filters + Actions */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Room Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Room</label>
            <select
              value={selectedRoom || 'all'}
              onChange={(e) => onRoomChange(e.target.value)}
              className="h-8 rounded-md border bg-background px-3 text-sm min-w-[120px]"
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
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Treatment</label>
            <select
              value={selectedTreatment || 'all'}
              onChange={(e) => onTreatmentChange(e.target.value)}
              className="h-8 rounded-md border bg-background px-3 text-sm min-w-[140px]"
            >
              <option value="all">All Treatments</option>
              {availableTreatments.map((treatment) => (
                <option key={treatment} value={treatment}>
                  {treatment}
                </option>
              ))}
            </select>
          </div>

          {/* Active Filters Badge */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="h-7 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onPreview}
            aria-label="Preview document"
          >
            <Eye className="h-4 w-4 mr-2" /> Preview
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onPrint} 
            aria-label="Print document"
            disabled={isGenerating}
          >
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={onDownloadPDF}
            disabled={isGenerating}
            aria-label="Download as PDF"
          >
            <Download className="h-4 w-4 mr-2" /> 
            {isGenerating ? 'Generating...' : 'Download PDF'}
          </Button>
        </div>
      </div>
    </Card>
  );
};
