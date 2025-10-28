import { StatusSlotManager } from "../StatusSlotManager";
import { SeedJobStatuses } from "../SeedJobStatuses";
import { CleanupDuplicateStatuses } from "../CleanupDuplicateStatuses";

export const StatusManagement = () => {
  return (
    <div className="space-y-4">
      <CleanupDuplicateStatuses />
      <SeedJobStatuses />
      <StatusSlotManager />
    </div>
  );
};