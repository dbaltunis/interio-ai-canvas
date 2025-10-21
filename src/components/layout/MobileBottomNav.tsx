import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FolderOpen, 
  Users, 
  Package, 
  Calendar,
  Plus,
  UserCircle,
} from "lucide-react";
import { useState } from "react";
import { CreateActionDialog } from "./CreateActionDialog";
import { UserProfile } from "./UserProfile";
import { useUserPresence } from "@/hooks/useUserPresence";
import { useDirectMessages } from "@/hooks/useDirectMessages";
import { TeamCollaborationCenter } from "../collaboration/TeamCollaborationCenter";

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

export const MobileBottomNav = ({ activeTab, onTabChange }: MobileBottomNavProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [presencePanelOpen, setPresencePanelOpen] = useState(false);
  
  const { activeUsers, currentUser } = useUserPresence();
  const { conversations } = useDirectMessages();
  
  const otherActiveUsers = activeUsers.filter(user => user.user_id !== currentUser?.user_id && user.status === 'online');
  const unreadCount = conversations.reduce((total, conv) => total + conv.unread_count, 0);
  const hasActivity = otherActiveUsers.length > 0 || unreadCount > 0;

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
          
          {/* Center Create Button with InterioApp Brand Gradient */}
          <div className="relative flex items-center justify-center">
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="absolute -top-6 h-14 w-14 rounded-full shadow-2xl hover:shadow-[0_0_40px_hsl(var(--primary)/0.6)] transition-all duration-300 hover:scale-110 border-2 border-white/30 bg-gradient-to-r from-primary via-secondary to-accent"
            >
              <Plus className="h-7 w-7 text-white drop-shadow-lg" />
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
        </div>
      </nav>
      
      <CreateActionDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
        onTabChange={onTabChange}
        onOpenSettings={() => {
          // Navigate to settings - could open a settings route
          window.location.href = '/settings';
        }}
        onOpenTeamHub={() => setPresencePanelOpen(true)}
      />
      
      <TeamCollaborationCenter 
        isOpen={presencePanelOpen}
        onToggle={() => setPresencePanelOpen(!presencePanelOpen)}
      />
    </>
  );
};
