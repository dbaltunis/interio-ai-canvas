
import React, { useState } from 'react';
import { BrandHeader } from './BrandHeader';
import { UserProfile } from './UserProfile';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import { ModernUserPresence } from '../collaboration/ModernUserPresence';
import { ModernMessageCenter } from '../collaboration/ModernMessageCenter';
import { AINotificationToast } from '../collaboration/AINotificationToast';
import { Button } from '@/components/ui/button';
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

  return (
    <>
      {/* Desktop Header with AI styling */}
      <header className="glass-morphism border-b border-company-secondary/30 shadow-xl sticky top-0 z-40 backdrop-blur-md">
        <div className="w-full px-4 sm:px-6 lg:px-8 ai-gradient-bg">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Left side - Logo (made twice bigger) */}
            <div className="flex items-center">
              <BrandHeader size="xl" showTagline={true} />
            </div>
            
            {/* Right side - Navigation, User Profile, and Mobile Menu */}
            <div className="flex items-center space-x-3">
              {/* Navigation (hidden on mobile, made 3px bigger) */}
              <nav className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => onTabChange(item.id)}
                      className={cn(
                        "px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 relative overflow-hidden",
                        isActive
                          ? "bg-gradient-to-r from-[#415e6b] to-[#9bb6bc] text-white shadow-lg scale-105"
                          : "text-gray-700 hover:text-[#415e6b] hover:bg-[#9bb6bc]/10 backdrop-blur-sm"
                      )}
                    >
                      <Icon className="h-5 w-5 mr-2" />
                      <span className="relative z-10">{item.label}</span>
                      {isActive && (
                        <div className="absolute inset-0 ai-shimmer opacity-20" />
                      )}
                    </Button>
                  );
                })}
              </nav>
              
              {/* Collaboration Tools - AI styled */}
              <div className="hidden md:flex items-center space-x-2">
                <Button
                  variant="ai"
                  size="sm"
                  onClick={() => setMessageDialogOpen(true)}
                  className="relative"
                >
                  <MessageCircle className="h-5 w-5" />
                  {/* AI notification indicator with your colors */}
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-[#9bb6bc] to-[#415e6b] rounded-full animate-pulse" />
                </Button>
                
                <Button
                  variant="ai"
                  size="sm"
                  onClick={() => setPresencePanelOpen(!presencePanelOpen)}
                  className="relative"
                >
                  <Users className="h-5 w-5" />
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
                className="md:hidden text-brand-neutral hover:text-brand-primary"
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

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-brand-secondary/20">
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
                      "w-full justify-start px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300",
                      isActive
                        ? "bg-gradient-to-r from-[#415e6b] to-[#9bb6bc] text-white shadow-lg"
                        : "text-gray-700 hover:text-[#415e6b] hover:bg-[#9bb6bc]/10"
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

      {/* Modern AI-style components */}
      <ModernUserPresence 
        isOpen={presencePanelOpen}
        onToggle={() => setPresencePanelOpen(!presencePanelOpen)}
      />

      <ModernMessageCenter 
        isOpen={messageDialogOpen}
        onClose={() => setMessageDialogOpen(false)}
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
