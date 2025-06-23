
import { useState } from "react";
import { UserProfile } from "@/components/layout/UserProfile";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { JobsPage } from "@/components/jobs/JobsPage";
import { QuoteManagement } from "@/components/quotes/QuoteManagement";
import { ClientManagement } from "@/components/clients/ClientManagement";
import { ProjectManagement } from "@/components/projects/ProjectManagement";
import { InventoryManagement } from "@/components/inventory/InventoryManagement";
import { WorkshopManagement } from "@/components/workshop/WorkshopManagement";
import { JobEditor } from "@/components/job-editor/JobEditor";
import { CalendarView } from "@/components/calendar/CalendarView";
import { CalculatorView } from "@/components/calculator/CalculatorView";
import { SettingsView } from "@/components/settings/SettingsView";
import { LibraryPage } from "@/components/library/LibraryPage";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  FolderOpen, 
  Package, 
  Wrench,
  Calendar,
  Settings,
  Calculator,
  BookOpen
} from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const navItems = [
    { id: "dashboard", label: "Home", icon: LayoutDashboard },
    { id: "jobs", label: "Jobs", icon: FolderOpen },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "inventory", label: "Library", icon: Package },
  ];

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "jobs":
        return <JobsPage />;
      case "projects":
        return <ProjectManagement />;
      case "job-editor":
        return <JobEditor />;
      case "quotes":
        return <QuoteManagement />;
      case "workshop":
        return <WorkshopManagement />;
      case "inventory":
        return <LibraryPage />;
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
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold text-gray-900">InterioApp</h1>
              
              {/* Navigation Menu */}
              <nav className="flex space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant={activeTab === item.id ? "default" : "ghost"}
                      className="flex items-center space-x-2 px-3 py-2"
                      onClick={() => setActiveTab(item.id)}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Button>
                  );
                })}
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <AIAssistant />
              <UserProfile />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderActiveComponent()}
      </main>
    </div>
  );
};

export default Index;
