import { StatusSlotManager } from "../StatusSlotManager";
import { SeedJobStatuses } from "../SeedJobStatuses";
import { CleanupDuplicateStatuses } from "../CleanupDuplicateStatuses";
import { FixJobStatuses } from "../FixJobStatuses";

export const StatusManagement = () => {
  return (
    <div className="space-y-4">
      <FixJobStatuses />
      <CleanupDuplicateStatuses />
      <SeedJobStatuses />
      <StatusSlotManager />
    </div>
  );
};