import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useFeatureFlags, useUpdateFeatureFlag } from "@/hooks/useFeatureFlags";
import { toast } from "sonner";
import { Settings } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export const FeatureFlagHelper = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: flags = {} } = useFeatureFlags();
  const updateFlag = useUpdateFeatureFlag();

  const toggleFlag = async (flag: string, enabled: boolean) => {
    try {
      await updateFlag.mutateAsync({ flag, enabled });
      toast.success(`Feature flag "${flag}" ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error(`Failed to update feature flag: ${error}`);
    }
  };

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="shadow-lg">
            <Settings className="h-4 w-4 mr-2" />
            Dev Flags
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="bg-background border rounded-lg p-4 shadow-lg min-w-64">
            <h3 className="font-semibold mb-3 text-sm">Feature Flags</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs">CRM Sheet View</span>
                <Button
                  variant={flags['crm_sheet_view_enabled'] ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleFlag('crm_sheet_view_enabled', !flags['crm_sheet_view_enabled'])}
                  disabled={updateFlag.isPending}
                >
                  {flags['crm_sheet_view_enabled'] ? 'ON' : 'OFF'}
                </Button>
              </div>
            </div>
            {flags['crm_sheet_view_enabled'] && (
              <div className="mt-3 pt-3 border-t">
                <Link
                  to="/crm/sheet"
                  className="text-xs text-blue-600 hover:underline"
                >
                  → Open CRM Sheet
                </Link>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};