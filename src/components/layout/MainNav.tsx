
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  BookOpen,
  PlusCircle,
  ShoppingCart
} from "lucide-react";
import { useMaterialQueueCount } from "@/hooks/useMaterialQueueCount";
import { useHasPermission } from "@/hooks/usePermissions";

interface MainNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Homepage", icon: LayoutDashboard },
  { id: "projects", label: "Projects", icon: FolderOpen, permission: "view_jobs" },
  { id: "job-editor", label: "Job Editor", icon: PlusCircle, permission: "create_jobs" },
  { id: "quotes", label: "Quote Builder", icon: FileText, permission: "view_jobs" },
  { id: "workshop", label: "Work Orders", icon: Wrench, permission: "view_jobs" },
  { id: "inventory", label: "Product Library", icon: Package, permission: "view_inventory" },
  { id: "ordering-hub", label: "Ordering Hub", icon: ShoppingCart, badge: true, permission: "view_inventory" },
  { id: "calendar", label: "Calendar", icon: Calendar, permission: "view_calendar" },
  { id: "clients", label: "CRM", icon: Users, permission: "view_clients" },
  { id: "calculator", label: "Calculator", icon: Calculator },
  { id: "settings", label: "Settings", icon: Settings, permission: "view_settings" },
];

export const MainNav = ({ activeTab, onTabChange }: MainNavProps) => {
  const { data: queueCount } = useMaterialQueueCount();
  
  // Permission checks
  const canViewJobs = useHasPermission('view_jobs');
  const canCreateJobs = useHasPermission('create_jobs');
  const canViewInventory = useHasPermission('view_inventory');
  const canViewCalendar = useHasPermission('view_calendar');
  const canViewClients = useHasPermission('view_clients');
  const canViewSettings = useHasPermission('view_settings');
  
  // Filter nav items based on permissions
  const visibleNavItems = navItems.filter(item => {
    if (!item.permission) return true; // No permission required
    
    if (item.permission === 'view_jobs') return canViewJobs === true;
    if (item.permission === 'create_jobs') return canCreateJobs === true;
    if (item.permission === 'view_inventory') return canViewInventory === true;
    if (item.permission === 'view_calendar') return canViewCalendar === true;
    if (item.permission === 'view_clients') return canViewClients === true;
    if (item.permission === 'view_settings') return canViewSettings === true;
    
    return false;
  });
  
  return (
    <nav className="w-64 bg-background border-r border-border min-h-screen hidden lg:block">
      <div className="p-6">
        <div className="space-y-2">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const showBadge = item.badge && queueCount && queueCount > 0;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start transition-all duration-200 text-sm font-medium relative",
                  activeTab === item.id 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
                {showBadge && (
                  <Badge 
                    variant="destructive" 
                    className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
                  >
                    {queueCount}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
