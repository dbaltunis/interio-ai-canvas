import React from "react";
import { WorkshopData } from "@/hooks/useWorkshopData";
import { WorkshopInformation } from "./templates/WorkshopInformation";
import { CombinedWorkshopInfo } from "./templates/CombinedWorkshopInfo";
import { LivePreview } from "../settings/templates/visual-editor/LivePreview";

interface DocumentRendererProps {
  template: string;
  data?: WorkshopData;
  blocks?: any[];
}

export const DocumentRenderer: React.FC<DocumentRendererProps> = ({ template, data, blocks }) => {
  // If we have blocks (from enhanced templates), render using LivePreview
  if (blocks && blocks.length > 0) {
    // Basic project data for LivePreview (workshop data structure is different)
    const projectData = {
      project: { 
        id: 'workshop-project',
        client_id: null 
      },
      treatments: [],
      rooms: [],
      surfaces: [],
      subtotal: 0,
      taxRate: 0.1,
      taxAmount: 0,
      total: 0,
      markupPercentage: 0,
      windowSummaries: []
    };

    return (
      <div className="bg-white">
        <LivePreview 
          blocks={blocks} 
          projectData={projectData}
          isEditable={false}
        />
      </div>
    );
  }

  // Fallback to original templates
  if (!data) return null;

  switch (template) {
    case "workshop-info":
      return <CombinedWorkshopInfo data={data} />;
    default:
      return <WorkshopInformation data={data} />;
  }
};
