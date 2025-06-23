
import { useState } from "react";
import { MainNav } from "@/components/layout/MainNav";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { QuoteManagement } from "@/components/quotes/QuoteManagement";
import { ClientManagement } from "@/components/clients/ClientManagement";
import { ProjectManagement } from "@/components/projects/ProjectManagement";
import { InventoryManagement } from "@/components/inventory/InventoryManagement";
import { WorkshopManagement } from "@/components/workshop/WorkshopManagement";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { Card } from "@/components/ui/card";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "quotes":
        return <QuoteManagement />;
      case "clients":
        return <ClientManagement />;
      case "projects":
        return <ProjectManagement />;
      case "inventory":
        return <InventoryManagement />;
      case "workshop":
        return <WorkshopManagement />;
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
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
                U
              </div>
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
