import { SettingsView } from "@/components/settings/SettingsView";
import { Card, CardContent } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

const MobileSettings = () => {
  return (
    <div className="p-4 pb-20 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <SettingsIcon className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-xl font-bold">Settings</h1>
      </div>
      
      <Card>
        <CardContent className="p-4">
          <SettingsView />
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileSettings;
