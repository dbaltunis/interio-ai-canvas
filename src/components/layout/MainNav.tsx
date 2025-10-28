
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

interface MainNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Homepage", icon: LayoutDashboard },
  { id: "projects", label: "Projects", icon: FolderOpen },
  { id: "job-editor", label: "Job Editor", icon: PlusCircle },
  { id: "quotes", label: "Quote Builder", icon: FileText },
  { id: "workshop", label: "Work Orders", icon: Wrench },
  { id: "inventory", label: "Product Library", icon: Package },
  { id: "ordering-hub", label: "Ordering Hub", icon: ShoppingCart, badge: true },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "clients", label: "CRM", icon: Users },
  { id: "calculator", label: "Calculator", icon: Calculator },
  { id: "settings", label: "Settings", icon: Settings },
];

export const MainNav = ({ activeTab, onTabChange }: MainNavProps) => {
  const { data: queueCount } = useMaterialQueueCount();
  
  return (
    <nav className="w-64 bg-background border-r border-border min-h-screen hidden lg:block">
      <div className="p-6">
        <div className="space-y-2">
          {navItems.map((item) => {
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
