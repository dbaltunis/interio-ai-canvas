import { FeatureFlagGuard } from "@/components/crm/FeatureFlagGuard";
import { CrmSheetPage } from "@/components/crm/CrmSheetPage";

const CrmSheet = () => {
  return (
    <FeatureFlagGuard flag="crm_sheet_view_enabled">
      <div className="min-h-screen bg-background p-6">
        <CrmSheetPage />
      </div>
    </FeatureFlagGuard>
  );
};

export default CrmSheet;