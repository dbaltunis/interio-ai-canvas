import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useOrderScheduleSettings, useUpdateScheduleSettings } from "@/hooks/useOrderSchedule";
import { Save, Settings as SettingsIcon } from "lucide-react";
import { SupplierPerformanceCard } from "./SupplierPerformanceCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
];

export const OrderScheduleSettings = () => {
  const { data: settings } = useOrderScheduleSettings();
  const updateSettings = useUpdateScheduleSettings();

  const { data: suppliers } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const [scheduleDays, setScheduleDays] = useState<string[]>([]);
  const [autoCreateBatches, setAutoCreateBatches] = useState(false);
  const [leadTimeDays, setLeadTimeDays] = useState(7);
  const [autoAssignSuppliers, setAutoAssignSuppliers] = useState(true);
  const [showPricesToSuppliers, setShowPricesToSuppliers] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);

  useEffect(() => {
    if (settings) {
      setScheduleDays(settings.schedule_days || []);
      setAutoCreateBatches(settings.auto_create_batches);
      setLeadTimeDays(settings.lead_time_days);
      setAutoAssignSuppliers(settings.auto_assign_suppliers);
      setShowPricesToSuppliers(settings.show_prices_to_suppliers ?? false);
      setEmailNotifications(settings.notification_preferences?.email ?? true);
      setInAppNotifications(settings.notification_preferences?.in_app ?? true);
    }
  }, [settings]);

  const handleDayToggle = (dayId: string) => {
    setScheduleDays(prev =>
      prev.includes(dayId)
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId]
    );
  };

  const handleSave = () => {
    updateSettings.mutate({
      schedule_days: scheduleDays,
      auto_create_batches: autoCreateBatches,
      lead_time_days: leadTimeDays,
      auto_assign_suppliers: autoAssignSuppliers,
      show_prices_to_suppliers: showPricesToSuppliers,
      notification_preferences: {
        email: emailNotifications,
        in_app: inAppNotifications,
      },
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Order Schedule</CardTitle>
          <CardDescription>
            Configure your ordering schedule and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Schedule Days */}
          <div className="space-y-3">
            <Label>Order Days</Label>
            <p className="text-sm text-muted-foreground">
              Select the days you typically place orders with suppliers
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {DAYS_OF_WEEK.map(day => (
                <div key={day.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={day.id}
                    checked={scheduleDays.includes(day.id)}
                    onCheckedChange={() => handleDayToggle(day.id)}
                  />
                  <Label htmlFor={day.id} className="cursor-pointer">
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Lead Time */}
          <div className="space-y-2">
            <Label htmlFor="leadTime">Default Lead Time (days)</Label>
            <Input
              id="leadTime"
              type="number"
              min={1}
              value={leadTimeDays}
              onChange={(e) => setLeadTimeDays(parseInt(e.target.value) || 7)}
              className="max-w-xs"
            />
            <p className="text-sm text-muted-foreground">
              Expected time for suppliers to deliver orders
            </p>
          </div>

          {/* Auto Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-create Batch Orders</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically create draft batch orders on schedule days
                </p>
              </div>
              <Switch
                checked={autoCreateBatches}
                onCheckedChange={setAutoCreateBatches}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-assign Suppliers</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically assign default suppliers to materials
                </p>
              </div>
              <Switch
                checked={autoAssignSuppliers}
                onCheckedChange={setAutoAssignSuppliers}
              />
            </div>
          </div>

          {/* Supplier Communication Settings */}
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label className="text-base">Supplier Communication</Label>
              <p className="text-sm text-muted-foreground">
                Control what information is shared with suppliers
              </p>
            </div>
            
            <div className="flex items-start justify-between p-4 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <Label>Show Prices to Suppliers</Label>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-600 text-white font-medium">
                    Not Recommended
                  </span>
                </div>
                <p className="text-sm text-muted-foreground pr-4">
                  <strong>⚠️ Security Note:</strong> Standard retail practice is to NOT share internal pricing with suppliers. 
                  Only enable this if you have specific agreements with trusted suppliers who need to see your pricing.
                </p>
                <p className="text-xs text-muted-foreground italic mt-2">
                  When disabled (default), suppliers only receive material names and quantities.
                </p>
              </div>
              <Switch
                checked={showPricesToSuppliers}
                onCheckedChange={setShowPricesToSuppliers}
              />
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-3">
            <Label>Notifications</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email"
                  checked={emailNotifications}
                  onCheckedChange={(checked) => setEmailNotifications(!!checked)}
                />
                <Label htmlFor="email" className="cursor-pointer">
                  Email notifications
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inapp"
                  checked={inAppNotifications}
                  onCheckedChange={(checked) => setInAppNotifications(!!checked)}
                />
                <Label htmlFor="inapp" className="cursor-pointer">
                  In-app notifications
                </Label>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={updateSettings.isPending}
            className="w-full sm:w-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Supplier Performance */}
      {suppliers && suppliers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Supplier Performance
            </CardTitle>
            <CardDescription>
              Historical performance metrics for your suppliers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {suppliers.slice(0, 4).map((supplier) => (
                <SupplierPerformanceCard
                  key={supplier.id}
                  supplierId={supplier.id}
                  supplierName={supplier.name}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
