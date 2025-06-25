
import { useState } from "react";
import { UserProfile } from "@/components/layout/UserProfile";
import { BrandHeader } from "@/components/layout/BrandHeader";
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
import { useAuth } from "@/components/auth/AuthProvider";
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
  LogOut
} from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("jobs");
  const { signOut } = useAuth();

  const navItems = [
    { id: "dashboard", label: "Home", icon: LayoutDashboard },
    { id: "jobs", label: "Jobs", icon: FolderOpen },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "inventory", label: "Library", icon: Package },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

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
        return <JobsPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Navigation with Brand Header */}
      <header className="bg-white border-b border-brand-secondary/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <BrandHeader size="sm" />
              
              {/* Navigation Menu */}
              <nav className="flex space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant={activeTab === item.id ? "default" : "ghost"}
                      className={`flex items-center space-x-2 px-4 py-2 transition-all duration-200 ${
                        activeTab === item.id 
                          ? "bg-brand-primary text-white hover:bg-brand-accent" 
                          : "text-brand-neutral hover:bg-brand-secondary/10 hover:text-brand-primary"
                      }`}
                      onClick={() => setActiveTab(item.id)}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{item.label}</span>
                    </Button>
                  );
                })}
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <AIAssistant />
              <UserProfile />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-brand-neutral hover:text-brand-accent hover:bg-brand-accent/10"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-brand-secondary/20 min-h-[calc(100vh-8rem)]">
          <div className="p-6">
            {renderActiveComponent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
