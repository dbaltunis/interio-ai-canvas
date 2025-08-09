import React from "react";
import { WorkshopData } from "@/hooks/useWorkshopData";
import { WorkshopInformation } from "./templates/WorkshopInformation";

interface DocumentRendererProps {
  template: string;
  data?: WorkshopData;
}

export const DocumentRenderer: React.FC<DocumentRendererProps> = ({ template, data }) => {
  if (!data) return null;

  switch (template) {
    case "workshop-info":
    default:
      return <WorkshopInformation data={data} />;
  }
};
