import React from "react";
import { WorkshopData } from "@/hooks/useWorkshopData";
import { WorkshopInformation } from "./templates/WorkshopInformation";
import { CombinedWorkshopInfo } from "./templates/CombinedWorkshopInfo";

interface DocumentRendererProps {
  template: string;
  data?: WorkshopData;
}

export const DocumentRenderer: React.FC<DocumentRendererProps> = ({ template, data }) => {
  if (!data) return null;

  switch (template) {
    case "workshop-info":
      // Render the original workshop info plus visual previews
      return <CombinedWorkshopInfo data={data} />;
    default:
      return <WorkshopInformation data={data} />;
  }
};
