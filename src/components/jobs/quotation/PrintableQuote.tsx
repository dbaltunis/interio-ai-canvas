import React from "react";
import { LivePreview } from "@/components/settings/templates/visual-editor/LivePreview";

interface PrintableQuoteProps {
  blocks: any[];
  projectData: any;
  isPrintMode?: boolean;
  showDetailedBreakdown?: boolean;
  showImages?: boolean;
}

export const PrintableQuote = React.forwardRef<HTMLDivElement, PrintableQuoteProps>(
  ({ blocks, projectData, isPrintMode = true, showDetailedBreakdown, showImages }, ref) => {
    return (
      <div 
        ref={ref}
        className="bg-white text-black"
        style={{
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          lineHeight: '1.5',
          color: '#000000',
          backgroundColor: '#ffffff',
          width: '794px',
          minWidth: '794px',
          maxWidth: '794px',
          padding: '0',
          margin: '0',
          boxSizing: 'border-box',
          overflow: 'visible'
        }}
      >
        <LivePreview 
          blocks={blocks} 
          projectData={projectData}
          isEditable={false}
          isPrintMode={isPrintMode}
        />
      </div>
    );
  }
);

PrintableQuote.displayName = 'PrintableQuote';
