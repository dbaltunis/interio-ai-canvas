import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Printer, Settings2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface WorkroomToolbarProps {
  selectedTemplate: string;
  onTemplateChange: (value: string) => void;
  groupByRoom: boolean;
  onToggleGroupBy: () => void;
  onPrint: () => void;
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
    <Card className="no-print p-3 flex items-center justify-between gap-3">
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
          <optgroup label="Coming Soon">
            <option value="packing-slip" disabled>
              Packing Slip (soon)
            </option>
            <option value="box-label" disabled>
              Box Label (soon)
            </option>
            <option value="wraps" disabled>
              Wraps (soon)
            </option>
          </optgroup>
        </select>

        <div className="flex items-center gap-2 pl-2">
          <label className="text-sm">Group by room</label>
          <input
            type="checkbox"
            checked={groupByRoom}
            onChange={onToggleGroupBy}
            aria-label="Toggle group by room"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onPrint} aria-label="Print document">
          <Printer className="h-4 w-4 mr-2" /> Print
        </Button>
        <Button variant="outline" size="sm" disabled aria-label="Export as PDF">
          <Download className="h-4 w-4 mr-2" /> Export PDF
        </Button>
        <Button variant="ghost" size="icon" aria-label="Worksheet settings" disabled>
          <Settings2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
