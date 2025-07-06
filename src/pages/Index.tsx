
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { UserProfile } from "@/components/layout/UserProfile";
import { BrandHeader } from "@/components/layout/BrandHeader";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { JobsPage } from "@/components/jobs/JobsPage";
import { CalendarView } from "@/components/calendar/CalendarView";
import { LibraryPage } from "@/components/library/LibraryPage";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { 
  LayoutDashboard, 
  FolderOpen, 
  Calendar,
  Package,
  Settings
} from "lucide-react";

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get('tab') || "jobs";
  });
  const { signOut } = useAuth();

  const navItems = [
    { id: "dashboard", label: "Home", icon: LayoutDashboard },
    { id: "jobs", label: "Jobs", icon: FolderOpen },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "library", label: "Library", icon: Package },
  ];

  // Update URL when active tab changes, but only if it's different from current URL
  useEffect(() => {
    const currentTab = searchParams.get('tab') || "jobs";
    if (activeTab !== currentTab) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [activeTab, setSearchParams]); // Removed searchParams from dependencies to prevent loop

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleSettingsClick = () => {
    window.location.href = "/settings";
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "jobs":
        return <JobsPage />;
      case "library":
        return <LibraryPage />;
      case "calendar":
        return <CalendarView />;
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
                      onClick={() => handleTabChange(item.id)}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{item.label}</span>
                    </Button>
                  );
                })}
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleSettingsClick}
                className="flex items-center space-x-2 text-brand-neutral hover:bg-brand-secondary/10 hover:text-brand-primary"
              >
                <Settings className="h-4 w-4" />
                <span className="font-medium">Settings</span>
              </Button>
              <UserProfile />
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
