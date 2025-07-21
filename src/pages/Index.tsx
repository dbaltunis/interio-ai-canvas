
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { UserProfile } from "@/components/layout/UserProfile";
import { BrandHeader } from "@/components/layout/BrandHeader";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { Dashboard } from "@/components/dashboard/Dashboard";
import JobsPage from "@/components/jobs/JobsPage";
import { LibraryPage } from "@/components/library/LibraryPage";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { 
  LayoutDashboard, 
  FolderOpen, 
  Calendar,
  Package
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
  }, [activeTab, setSearchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "jobs":
        return <JobsPage />;
      case "library":
        return <LibraryPage />;
      case 'calendar':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Calendar</h1>
            <div className="text-center text-muted-foreground">
              Calendar functionality coming soon...
            </div>
          </div>
        );
      default:
        return <JobsPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Top Navigation with Brand Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and App Name only */}
            <BrandHeader size="sm" />
            
            {/* Right side - Navigation Menu, Notifications, and User Profile */}
            <div className="flex items-center space-x-1">
              {/* Navigation Menu */}
              <nav className="flex space-x-1 mr-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant={activeTab === item.id ? "default" : "ghost"}
                      className={`flex items-center space-x-2 px-4 py-2 transition-all duration-200 ${
                        activeTab === item.id 
                          ? "bg-blue-600 text-white hover:bg-blue-700" 
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                      onClick={() => handleTabChange(item.id)}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{item.label}</span>
                    </Button>
                  );
                })}
              </nav>
              
              {/* Notification Bell */}
              <NotificationCenter />
              
              {/* User Profile */}
              <UserProfile />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Full Width */}
      <main className="w-full">
        {renderActiveComponent()}
      </main>
    </div>
  );
};

export default Index;
