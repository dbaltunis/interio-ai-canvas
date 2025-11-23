import React from "react";
import { DocumentRenderer } from "./DocumentRenderer";
import { WorkshopData } from "@/hooks/useWorkshopData";

interface PrintableWorkshopProps {
  data: WorkshopData;
  orientation: 'portrait' | 'landscape';
  margins: number;
  projectId?: string;
  template: string;
  blocks?: any[];
}

export const PrintableWorkshop = React.forwardRef<HTMLDivElement, PrintableWorkshopProps>(
  ({ data, orientation, margins, projectId, template, blocks }, ref) => {
    const width = orientation === 'landscape' ? '297mm' : '210mm';
    const minHeight = orientation === 'landscape' ? '210mm' : '297mm';
    
    return (
      <div 
        ref={ref}
        className="bg-white text-black workshop-printable"
        style={{
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: '10pt',
          lineHeight: '1.4',
          color: '#000000',
          backgroundColor: '#ffffff',
          width,
          minHeight,
          padding: `${margins}mm`,
          margin: '0',
          boxSizing: 'border-box',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <DocumentRenderer 
          template={template} 
          data={data}
          blocks={blocks}
          projectId={projectId}
          orientation={orientation}
        />
      </div>
    );
  }
);

PrintableWorkshop.displayName = 'PrintableWorkshop';
