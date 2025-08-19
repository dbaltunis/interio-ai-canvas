
import React, { useState } from 'react';
import { BrandHeader } from './BrandHeader';
import { UserProfile } from './UserProfile';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import { TeamCollaborationCenter } from '../collaboration/TeamCollaborationCenter';
import { AINotificationToast } from '../collaboration/AINotificationToast';
import { Button } from '@/components/ui/button';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  FolderOpen, 
  Package, 
  Calendar,
  Menu,
  X,
  MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResponsiveHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard },
  { id: "projects", label: "Jobs", icon: FolderOpen },
  { id: "clients", label: "CRM", icon: Users },
  { id: "quotes", label: "Emails", icon: FileText },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "inventory", label: "Library", icon: Package },
];

export const ResponsiveHeader = ({ activeTab, onTabChange }: ResponsiveHeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [presencePanelOpen, setPresencePanelOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  const { activeUsers, currentUser } = useUserPresence();
  const { conversations } = useDirectMessages();
  
  // Check if there are other active users or unread messages
  const otherActiveUsers = activeUsers.filter(user => user.user_id !== currentUser?.user_id && user.status === 'online');
  const unreadCount = conversations.reduce((total, conv) => total + conv.unread_count, 0);
  const hasActivity = otherActiveUsers.length > 0 || unreadCount > 0;

  return (
    <>
      {/* Desktop Header */}
      <header className="bg-background border-b border-border sticky top-0 z-40 relative overflow-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Left side - Logo (made twice bigger) */}
            <div className="flex items-center">
              <BrandHeader size="xl" showTagline={true} />
            </div>
            
            {/* Right side - Navigation, User Profile, and Mobile Menu */}
            <div className="flex items-center space-x-3">
              {/* Navigation (hidden on mobile, made 3px bigger) */}
              <nav className="hidden md:flex items-center space-x-1">
                {navItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => onTabChange(item.id)}
                      className={cn(
                        "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      )}
                    >
                      <Icon className="h-5 w-5 mr-2" />
                      <span className="relative inline-flex items-center">
                        {item.label}
                        <span
                          className="pointer-events-none absolute -bottom-[3px] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/95 to-transparent dark:via-primary/80 opacity-0 animate-[underline-flash_1.2s_ease-out_both]"
                          style={{ animationDelay: `${1.3 + idx * 0.25}s` }}
                          aria-hidden="true"
                        />
                      </span>
                    </Button>
                  );
                })}
              </nav>
              
              {/* Collaboration Tools */}
              <div className="hidden md:flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPresencePanelOpen(!presencePanelOpen)}
                  className="relative"
                >
                  {unreadCount > 0 ? (
                    <MessageCircle className="h-5 w-5" />
                  ) : (
                    <Users className="h-5 w-5" />
                  )}
                  {unreadCount > 0 && (
                    <div className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                  )}
                  {hasActivity && unreadCount === 0 && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                  )}
                </Button>
              </div>
              
              {/* Notification Bell */}
              <div className="hidden md:block">
                <NotificationDropdown />
              </div>
              
              {/* User Profile */}
              <UserProfile />
              
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5.5 w-5.5" />
                ) : (
                  <Menu className="h-5.5 w-5.5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* AI sweep overlay across header after 1s */}
        <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
          {/* Bold, glossy AI sweep across header after 1s (no stars) */}
          <div
            className="absolute -inset-y-10 -left-1/2 h-[240%] w-2/3 rotate-12 bg-gradient-to-r from-transparent via-primary/75 to-transparent dark:via-primary/60 opacity-90 blur-[6px] backdrop-blur-[1.5px] mix-blend-overlay shadow-[0_0_40px_hsl(var(--primary)/0.25)] animate-[ai-sweep_4.5s_cubic-bezier(0.22,0.61,0.36,1)_1_both]"
            style={{ animationDelay: '1s' }}
          />
          <div
            className="absolute -inset-y-12 -left-2/3 h-[260%] w-1/3 rotate-12 bg-gradient-to-r from-transparent via-primary/60 to-transparent dark:via-primary/50 opacity-80 blur-[4px] backdrop-blur-[1px] mix-blend-overlay animate-[ai-sweep_5s_cubic-bezier(0.22,0.61,0.36,1)_1_both]"
            style={{ animationDelay: '1.25s' }}
          />
          <div
            className="absolute -inset-y-8 -left-1/3 h-[220%] w-1/6 rotate-12 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-70 blur-[2px] animate-[ai-sweep_5.2s_cubic-bezier(0.22,0.61,0.36,1)_1_both]"
            style={{ animationDelay: '1.8s' }}
          />
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background border-t border-border">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onTabChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full justify-start px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </header>

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
