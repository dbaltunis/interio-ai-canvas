
import React, { useState } from 'react';
import { BrandHeader } from './BrandHeader';
import { UserProfile } from './UserProfile';
import { Badge } from '@/components/ui/badge';
// Removed NotificationDropdown - simplified UI
import { TeamCollaborationCenter } from '../collaboration/TeamCollaborationCenter';
import { AINotificationToast } from '../collaboration/AINotificationToast';
import { Button } from '@/components/ui/button';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { useMaterialQueueCount } from '@/hooks/useMaterialQueueCount';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  FolderOpen, 
  Package, 
  Calendar,
  Menu,
  X,
  MessageCircle,
  ShoppingCart
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResponsiveHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard, tourId: "dashboard-tab" },
  { id: "projects", label: "Jobs", icon: FolderOpen, tourId: "projects-tab" },
  { id: "clients", label: "CRM", icon: Users, tourId: "clients-tab" },
  { id: "quotes", label: "Emails", icon: FileText, tourId: "emails-tab" },
  { id: "calendar", label: "Calendar", icon: Calendar, tourId: "calendar-tab" },
  { id: "inventory", label: "Library", icon: Package, tourId: "library-tab" },
  { id: "ordering-hub", label: "Purchasing", icon: ShoppingCart, tourId: "ordering-hub-tab", badge: true },
];

export const ResponsiveHeader = ({ activeTab, onTabChange }: ResponsiveHeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [presencePanelOpen, setPresencePanelOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  const { activeUsers, currentUser } = useUserPresence();
  const { conversations } = useDirectMessages();
  const { data: queueCount } = useMaterialQueueCount();
  
  // Check if there are other active users or unread messages
  const otherActiveUsers = activeUsers.filter(user => user.user_id !== currentUser?.user_id && user.status === 'online');
  const unreadCount = conversations.reduce((total, conv) => total + conv.unread_count, 0);
  const hasActivity = otherActiveUsers.length > 0 || unreadCount > 0;

  return (
    <>
      {/* Desktop Header - hidden on mobile/tablet, they use bottom nav */}
      <header className="sticky top-0 z-40 w-full border-b glass-morphism-strong hidden lg:block"
        data-tour-id="header-profile"
      >
        <div className="flex h-16 items-center justify-between px-6 max-w-full">
          {/* Left: Logo */}
          <div className="flex items-center">
            <BrandHeader size="xl" showTagline={true} />
          </div>

          {/* Center: Navigation items */}
          <nav className="flex items-center space-x-2 lg:space-x-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const showBadge = item.badge && queueCount && queueCount > 0;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative",
                    activeTab === item.id 
                      ? "bg-primary text-primary-foreground shadow-sm border border-primary/20" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                  data-tour-id={item.tourId}
                >
                  <Icon className={cn(
                    "h-4 w-4 transition-transform",
                    activeTab === item.id && "scale-110"
                  )} />
                  <span className={cn(activeTab === item.id && "font-semibold")}>{item.label}</span>
                  {showBadge && (
                    <Badge 
                      variant="destructive" 
                      className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
                    >
                      {queueCount}
                    </Badge>
                  )}
                </button>
              );
            })}
          </nav>
          {/* Right: User Profile */}
          <div className="flex items-center space-x-4">
            <UserProfile 
              onOpenTeamHub={() => setPresencePanelOpen(!presencePanelOpen)}
              showCollaborationIndicator={hasActivity}
              unreadCount={unreadCount}
            />
          </div>
        </div>
      </header>

      {/* Mobile/Tablet Header - HIDDEN, using bottom nav instead */}
      {/* <header className="sticky top-0 z-40 w-full border-b glass-morphism-strong lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <BrandHeader size="md" showTagline={false} />
          <UserProfile 
            onOpenTeamHub={() => setPresencePanelOpen(!presencePanelOpen)}
            showCollaborationIndicator={hasActivity}
            unreadCount={unreadCount}
          />
        </div>
      </header> */}

      {/* Modern AI-style Team Collaboration */}
      <TeamCollaborationCenter 
        isOpen={presencePanelOpen}
        onToggle={() => setPresencePanelOpen(!presencePanelOpen)}
      />

      <AINotificationToast
        notifications={notifications}
        onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
        onAction={(id) => {
          // Handle notification action
          setMessageDialogOpen(true);
          setNotifications(prev => prev.filter(n => n.id !== id));
        }}
      />
    </>
  );
};
