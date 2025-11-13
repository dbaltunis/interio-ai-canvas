import React from "react";
import type { WorkshopData } from "@/hooks/useWorkshopData";
import { WorkshopInformation } from "./WorkshopInformation";

interface CombinedWorkshopInfoProps {
  data: WorkshopData;
  orientation?: 'portrait' | 'landscape';
  projectId?: string;
}

export const CombinedWorkshopInfo: React.FC<CombinedWorkshopInfoProps> = ({ data, orientation = 'portrait', projectId }) => {
  return <WorkshopInformation data={data} orientation={orientation} projectId={projectId} />;
};
