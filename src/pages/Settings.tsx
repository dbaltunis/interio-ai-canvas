
import { BrandHeader } from "@/components/layout/BrandHeader";
import { UserProfile } from "@/components/layout/UserProfile";
import { SettingsView } from "@/components/settings/SettingsView";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Settings = () => {
  const handleBackToApp = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Settings Header */}
      <header className="bg-white border-b border-brand-secondary/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleBackToApp}
                className="flex items-center space-x-2 text-brand-neutral hover:text-brand-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to App</span>
              </Button>
              <div className="h-6 w-px bg-brand-secondary/20" />
              <BrandHeader size="sm" />
            </div>
            
            <UserProfile />
          </div>
        </div>
      </header>

      {/* Settings Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-brand-secondary/20 min-h-[calc(100vh-8rem)]">
          <div className="p-6">
            <SettingsView />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
