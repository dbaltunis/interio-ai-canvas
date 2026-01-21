import { StatusSlotManager } from "../StatusSlotManager";
import { SeedJobStatuses } from "../SeedJobStatuses";
import { ClientStageSlotManager } from "../ClientStageSlotManager";
import { SeedClientStages } from "../SeedClientStages";
import { Separator } from "@/components/ui/separator";

export const StatusManagement = () => {
  return (
    <div className="space-y-6">
      {/* Job Status Workflow */}
      <SeedJobStatuses />
      <StatusSlotManager />
      
      <Separator className="my-8" />
      
      {/* Client Funnel Stages */}
      <SeedClientStages />
      <ClientStageSlotManager />
    </div>
  );
};