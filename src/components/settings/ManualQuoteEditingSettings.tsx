import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Edit3 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const ManualQuoteEditingSettings = () => {
  const { data: businessSettings } = useBusinessSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = React.useState(false);

  const isEnabled = (businessSettings as any)?.manual_quote_editing_enabled || false;

  const handleToggle = async (enabled: boolean) => {
    if (!businessSettings?.id) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("business_settings")
        .update({ manual_quote_editing_enabled: enabled } as any)
        .eq("id", businessSettings.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["business-settings"] });

      toast({
        title: enabled ? "Manual Editing Enabled" : "Manual Editing Disabled",
        description: enabled
          ? "Admins can now manually edit all quote and invoice fields."
          : "Manual quote editing has been disabled.",
      });
    } catch (error) {
      console.error("Error updating manual quote editing setting:", error);
      toast({
        title: "Error",
        description: "Failed to update setting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Edit3 className="h-5 w-5 text-primary" />
          <CardTitle>Manual Quote Editing</CardTitle>
        </div>
        <CardDescription>
          Enable manual editing of quote line items, quantities, prices, and all invoice fields
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="manual-editing" className="flex flex-col space-y-1">
            <span className="font-medium">Enable Manual Editing</span>
            <span className="text-sm text-muted-foreground font-normal">
              Allow admins to manually edit all quote and invoice details
            </span>
          </Label>
          <Switch
            id="manual-editing"
            checked={isEnabled}
            onCheckedChange={handleToggle}
            disabled={isUpdating}
          />
        </div>

        {isEnabled && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Manual editing is enabled. Admins will see an "Edit Quote Items" button in the
              quotation tab that allows full control over line items, pricing, and invoice details.
            </AlertDescription>
          </Alert>
        )}

        <div className="pt-2 border-t">
          <h4 className="text-sm font-medium mb-2">Features Included:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Add, remove, and reorder line items</li>
            <li>Edit product/service names and descriptions</li>
            <li>Adjust quantities and unit prices</li>
            <li>Override calculated totals if needed</li>
            <li>Modify discount settings</li>
            <li>Edit tax configuration</li>
            <li>Add custom notes and terms</li>
            <li>Full control over all invoice fields</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
