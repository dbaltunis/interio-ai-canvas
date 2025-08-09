import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Printer, Settings2 } from "lucide-react";
import React from "react";

interface WorkroomToolbarProps {
  selectedTemplate: string;
  onTemplateChange: (value: string) => void;
  groupByRoom: boolean;
  onToggleGroupBy: () => void;
  onPrint: () => void;
}

export const WorkroomToolbar: React.FC<WorkroomToolbarProps> = ({
  selectedTemplate,
  onTemplateChange,
  groupByRoom,
  onToggleGroupBy,
  onPrint,
}) => {
  return (
    <Card className="no-print p-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Document</label>
        <select
          aria-label="Select document type"
          value={selectedTemplate}
          onChange={(e) => onTemplateChange(e.target.value)}
          className="h-9 rounded-md border bg-background px-3 text-sm"
        >
          <option value="workshop-info">Workshop Information</option>
          <option value="packing-slip" disabled>
            Packing Slip (soon)
          </option>
          <option value="box-label" disabled>
            Box Label (soon)
          </option>
          <option value="wraps" disabled>
            Wraps (soon)
          </option>
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
