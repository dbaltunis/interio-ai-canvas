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
    // Use actual workshop data if available, otherwise create basic project data
    const projectData = data ? {
      project: { 
        id: 'workshop-project',
        client_id: null,
        name: data.header?.projectName || 'Workshop Project',
        job_number: data.header?.orderNumber || 'WS-001',
        created_at: data.header?.createdDate || new Date().toISOString()
      },
      treatments: data.rooms?.flatMap(room => room.items || []) || [],
      windowSummaries: [],
      rooms: data.rooms || [],
      surfaces: [],
      subtotal: 0,
      taxRate: 0.1,
      taxAmount: 0,
      total: 0,
      markupPercentage: 0,
      businessSettings: {}
    } : {
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
      windowSummaries: [],
      businessSettings: {}
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
