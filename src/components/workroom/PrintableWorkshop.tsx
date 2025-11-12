import React from "react";
import { WorkshopInformation } from "./templates/WorkshopInformation";
import { WorkshopData } from "@/hooks/useWorkshopData";

interface PrintableWorkshopProps {
  data: WorkshopData;
  orientation: 'portrait' | 'landscape';
  margins: number;
}

export const PrintableWorkshop = React.forwardRef<HTMLDivElement, PrintableWorkshopProps>(
  ({ data, orientation, margins }, ref) => {
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
        <WorkshopInformation data={data} />
      </div>
    );
  }
);

PrintableWorkshop.displayName = 'PrintableWorkshop';
