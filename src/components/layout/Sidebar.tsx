
import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Settings,
  Calendar,
  Package,
  BarChart3,
  UserPlus,
  FileText
} from "lucide-react";
import { BrandHeader } from "./BrandHeader";
import { UserProfile } from "./UserProfile";
import { Badge } from "@/components/ui/badge";
import { useHasPermission, useHasAnyPermission } from "@/hooks/usePermissions";

const Sidebar = () => {
  const location = useLocation();
  
  // Permission checks
  const canViewJobs = useHasPermission('view_jobs');
  const canViewClients = useHasPermission('view_clients');
  const canViewCalendar = useHasPermission('view_calendar');
  const canViewInventory = useHasPermission('view_inventory');
  const canViewAnalytics = useHasPermission('view_analytics');
  const canViewSettings = useHasAnyPermission(['view_settings', 'manage_settings']);

  const navigationItems = [
    {
      path: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
      show: true // Dashboard is always visible
    },
    {
      path: "/jobs",
      label: "Jobs",
      icon: Briefcase,
      show: canViewJobs
    },
    {
      path: "/crm",
      label: "CRM",
      icon: Users,
      show: canViewClients
    },
    {
      path: "/calendar",
      label: "Calendar",
      icon: Calendar,
      show: canViewCalendar
    },
    {
      path: "/inventory",
      label: "Inventory",
      icon: Package,
      show: canViewInventory
    },
    {
      path: "/analytics",
      label: "Analytics",
      icon: BarChart3,
      show: canViewAnalytics
    },
    {
      path: "/settings",
      label: "Settings",
      icon: Settings,
      show: canViewSettings
    }
  ].filter(item => item.show);

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <BrandHeader />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover-lift interactive-bounce ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100">
        <UserProfile />
      </div>
    </div>
  );
};

export default Sidebar;
