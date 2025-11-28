import { StatusSlotManager } from "../StatusSlotManager";
import { SeedJobStatuses } from "../SeedJobStatuses";

export const StatusManagement = () => {
  return (
    <div className="space-y-6">
      <SeedJobStatuses />
      <StatusSlotManager />
    </div>
  );
};