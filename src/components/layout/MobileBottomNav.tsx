import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  FolderOpen, 
  Users, 
  Package, 
  Calendar,
  Plus,
  Menu,
  Settings,
  LayoutDashboard
} from "lucide-react";
import { useState } from "react";
import { CreateActionDialog } from "./CreateActionDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "projects", label: "Jobs", icon: FolderOpen },
  { id: "clients", label: "Clients", icon: Users },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "inventory", label: "Library", icon: Package },
];

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "settings", label: "Settings", icon: Settings },
];

export const MobileBottomNav = ({ activeTab, onTabChange }: MobileBottomNavProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden z-50 glass-morphism-strong border-t border-border/50 pb-safe">
        <div className="relative grid grid-cols-5 h-16">
          {/* First two items */}
          {navItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "h-full rounded-none flex flex-col items-center justify-center gap-1 transition-all duration-200",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className={cn(
                  "transition-all duration-200",
                  isActive ? "h-5 w-5" : "h-4 w-4"
                )} />
                <span className={cn(
                  "text-[10px] font-medium transition-all duration-200",
                  isActive ? "opacity-100" : "opacity-70"
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-t-full" />
                )}
              </Button>
            );
          })}
          
          {/* Center Create Button with AI Gradient */}
          <div className="relative flex items-center justify-center">
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="absolute -top-6 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-br from-[#9b87f5] via-[#7E69AB] to-[#6E59A5] hover:shadow-[0_0_30px_rgba(155,135,245,0.5)] transition-all duration-300 hover:scale-110 border border-white/20"
              style={{
                background: 'linear-gradient(135deg, rgba(155,135,245,1) 0%, rgba(126,105,171,1) 50%, rgba(110,89,165,1) 100%)',
              }}
            >
              <Plus className="h-6 w-6 text-white drop-shadow-lg" />
            </Button>
          </div>
          
          {/* Last two items */}
          {navItems.slice(2).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "h-full rounded-none flex flex-col items-center justify-center gap-1 transition-all duration-200",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className={cn(
                  "transition-all duration-200",
                  isActive ? "h-5 w-5" : "h-4 w-4"
                )} />
                <span className={cn(
                  "text-[10px] font-medium transition-all duration-200",
                  isActive ? "opacity-100" : "opacity-70"
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-t-full" />
                )}
              </Button>
            );
          })}
          
          {/* Menu Button (Last position) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-full rounded-none flex flex-col items-center justify-center gap-1 transition-all duration-200 text-muted-foreground hover:text-foreground"
              >
                <Menu className="h-4 w-4 transition-all duration-200" />
                <span className="text-[10px] font-medium opacity-70">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              side="top"
              className="mb-2 bg-background/95 backdrop-blur-lg border-border z-[60]"
            >
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className="cursor-pointer"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
      
      <CreateActionDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
        onTabChange={onTabChange}
      />
    </>
  );
};
