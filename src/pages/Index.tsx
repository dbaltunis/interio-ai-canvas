
import { useState, useEffect } from "react";
import { ResponsiveHeader } from "@/components/layout/ResponsiveHeader";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { ProjectsPage } from "@/components/projects/ProjectsPage";
import { ClientFunnelDashboard } from "@/components/crm/ClientFunnelDashboard";
import { QuotesPage } from "@/components/quotes/QuotesPage";
import { CalendarPage } from "@/components/calendar/CalendarPage";
import { InventoryPage } from "@/components/inventory/InventoryPage";
import { useUserPresence } from "@/hooks/useUserPresence";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Track user presence with current page
  const getCurrentPagePath = () => {
    return `/?tab=${activeTab}`;
  };
  
  const { updatePresence } = useUserPresence(getCurrentPagePath());

  // Update presence when tab changes
  useEffect(() => {
    updatePresence(getCurrentPagePath());
  }, [activeTab, updatePresence]);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardPage />;
      case "projects":
        return <ProjectsPage />;
      case "clients":
        return <ClientFunnelDashboard />;
      case "quotes":
        return <QuotesPage />;
      case "calendar":
        return <CalendarPage />;
      case "inventory":
        return <InventoryPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ResponsiveHeader activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
