import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { useAccountSettings } from "@/hooks/useAccountSettings";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { useUserCurrency } from "@/components/job-creation/treatment-pricing/window-covering-options/currencyUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const SettingsInheritanceTest = () => {
  const { data: businessSettings } = useBusinessSettings();
  const { data: accountSettings } = useAccountSettings();
  const { units } = useMeasurementUnits();
  const userCurrency = useUserCurrency();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Settings Inheritance Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold">Business Settings</h3>
          <pre className="text-sm bg-muted p-2 rounded">
            {JSON.stringify(businessSettings, null, 2)}
          </pre>
        </div>
        
        <div>
          <h3 className="font-semibold">Account Settings</h3>
          <pre className="text-sm bg-muted p-2 rounded">
            {JSON.stringify(accountSettings, null, 2)}
          </pre>
        </div>
        
        <div>
          <h3 className="font-semibold">Measurement Units</h3>
          <pre className="text-sm bg-muted p-2 rounded">
            {JSON.stringify(units, null, 2)}
          </pre>
        </div>
        
        <div>
          <h3 className="font-semibold">User Currency</h3>
          <p className="text-lg font-bold">{userCurrency}</p>
        </div>
      </CardContent>
    </Card>
  );
};