
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MeasurementUnitsTab } from "./tabs/MeasurementUnitsTab";
import { TreatmentManagementTab } from "./tabs/TreatmentManagementTab";

export const SettingsView = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-brand-primary">Settings</h1>
        <p className="text-brand-neutral mt-2">
          Configure your business settings and preferences
        </p>
      </div>

      <Tabs defaultValue="measurement-units" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="measurement-units">Measurement Units</TabsTrigger>
          <TabsTrigger value="treatments">Treatment Management</TabsTrigger>
        </TabsList>

        <TabsContent value="measurement-units">
          <MeasurementUnitsTab />
        </TabsContent>

        <TabsContent value="treatments">
          <TreatmentManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
