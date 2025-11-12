import React from "react";
import { LivePreview } from "@/components/settings/templates/visual-editor/LivePreview";

interface PrintableWorkOrderProps {
  blocks: any[];
  workOrderData: any;
  isPrintMode?: boolean;
  showDetailedSpecs?: boolean;
  showImages?: boolean;
}

export const PrintableWorkOrder = React.forwardRef<HTMLDivElement, PrintableWorkOrderProps>(
  ({ blocks, workOrderData, isPrintMode = true, showDetailedSpecs, showImages }, ref) => {
    // Extract document settings from blocks
    const documentSettings = blocks?.find((b: any) => b.type === 'document-settings')?.content || {};
    const orientation = documentSettings.orientation || 'portrait';
    const marginTop = documentSettings.marginTop || 8;
    const marginRight = documentSettings.marginRight || 8;
    const marginBottom = documentSettings.marginBottom || 6;
    const marginLeft = documentSettings.marginLeft || 8;
    
    return (
      <div 
        ref={ref}
        className="bg-white text-black work-order-printable"
        style={{
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: '10pt',
          lineHeight: '1.4',
          color: '#000000',
          backgroundColor: '#ffffff',
          width: orientation === 'landscape' ? '297mm' : '210mm',
          minHeight: orientation === 'landscape' ? '210mm' : '297mm',
          padding: `${marginTop}mm ${marginRight}mm ${marginBottom}mm ${marginLeft}mm`,
          margin: '0',
          boxSizing: 'border-box',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <LivePreview 
          blocks={blocks} 
          projectData={workOrderData}
          isEditable={false}
          isPrintMode={isPrintMode}
          showDetailedBreakdown={showDetailedSpecs !== undefined ? showDetailedSpecs : true}
          showImages={showImages !== undefined ? showImages : true}
        />
      </div>
    );
  }
);

PrintableWorkOrder.displayName = 'PrintableWorkOrder';
