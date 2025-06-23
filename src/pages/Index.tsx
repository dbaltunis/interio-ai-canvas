
import { useState } from "react";
import { MainNav } from "@/components/layout/MainNav";
import { UserProfile } from "@/components/layout/UserProfile";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { QuoteManagement } from "@/components/quotes/QuoteManagement";
import { ClientManagement } from "@/components/clients/ClientManagement";
import { ProjectManagement } from "@/components/projects/ProjectManagement";
import { InventoryManagement } from "@/components/inventory/InventoryManagement";
import { WorkshopManagement } from "@/components/workshop/WorkshopManagement";
import { JobEditor } from "@/components/job-editor/JobEditor";
import { CalendarView } from "@/components/calendar/CalendarView";
import { CalculatorView } from "@/components/calculator/CalculatorView";
import { SettingsView } from "@/components/settings/SettingsView";
import { AIAssistant } from "@/components/ai/AIAssistant";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "projects":
        return <ProjectManagement />;
      case "job-editor":
        return <JobEditor />;
      case "quotes":
        return <QuoteManagement />;
      case "workshop":
        return <WorkshopManagement />;
      case "inventory":
        return <InventoryManagement />;
      case "calendar":
        return <CalendarView />;
      case "clients":
        return <ClientManagement />;
      case "calculator":
        return <CalculatorView />;
      case "settings":
        return <SettingsView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary">InterioApp</h1>
              <span className="text-sm text-muted-foreground">AI Window & Wall Covering Solutions</span>
            </div>
            <div className="flex items-center space-x-4">
              <AIAssistant />
              <UserProfile />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <MainNav activeTab={activeTab} onTabChange={setActiveTab} />
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {renderActiveComponent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
