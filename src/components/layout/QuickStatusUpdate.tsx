import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Check, X, Edit3, Clock, Coffee, Briefcase, MessageCircle } from 'lucide-react';
import { useCurrentUserProfile } from '@/hooks/useUserProfile';
import { useUpdateUserProfile } from '@/hooks/useUserProfile';
import { toast } from '@/hooks/use-toast';

const quickStatusOptions = [
  { icon: Clock, text: "Available", color: "bg-green-500" },
  { icon: Briefcase, text: "In a meeting", color: "bg-red-500" },
  { icon: Coffee, text: "On break", color: "bg-yellow-500" },
  { icon: MessageCircle, text: "Focus time", color: "bg-blue-500" },
];

export const QuickStatusUpdate = () => {
  const { data: userProfile } = useCurrentUserProfile();
  const updateProfile = useUpdateUserProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [customStatus, setCustomStatus] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  useEffect(() => {
    if (userProfile?.status_message) {
      setCustomStatus(userProfile.status_message);
    }
  }, [userProfile?.status_message]);

  const handleQuickStatusUpdate = async (statusText: string) => {
    try {
      await updateProfile.mutateAsync({ status_message: statusText });
      setIsOpen(false);
      toast({
        title: "Status updated",
        description: `Your status is now: ${statusText}`,
      });
    } catch (error) {
      toast({
        title: "Failed to update status",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCustomStatusSave = async () => {
    if (!customStatus.trim()) return;
    
    try {
      await updateProfile.mutateAsync({ status_message: customStatus.trim() });
      setIsCustomMode(false);
      setIsOpen(false);
      toast({
        title: "Status updated",
        description: `Your status is now: ${customStatus.trim()}`,
      });
    } catch (error) {
      toast({
        title: "Failed to update status",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClearStatus = async () => {
    try {
      await updateProfile.mutateAsync({ status_message: null });
      setCustomStatus('');
      setIsOpen(false);
      toast({
        title: "Status cleared",
        description: "Your status has been cleared.",
      });
    } catch (error) {
      toast({
        title: "Failed to clear status",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const currentStatus = userProfile?.status_message;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-1 hover:bg-accent rounded-full"
        >
          {currentStatus ? (
            <Badge variant="secondary" className="text-xs px-2 py-1 max-w-24 truncate">
              {currentStatus}
            </Badge>
          ) : (
            <div className="w-2 h-2 rounded-full bg-green-500" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Update Status</h4>
            {currentStatus && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearStatus}
                disabled={updateProfile.isPending}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
            )}
          </div>

          {!isCustomMode ? (
            <>
              {/* Quick status options */}
              <div className="space-y-1">
                {quickStatusOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.text}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuickStatusUpdate(option.text)}
                      disabled={updateProfile.isPending}
                      className="w-full justify-start h-8 px-2 text-xs"
                    >
                      <div className={`w-2 h-2 rounded-full ${option.color} mr-2`} />
                      <Icon className="h-3 w-3 mr-2" />
                      {option.text}
                    </Button>
                  );
                })}
              </div>

              {/* Custom status button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCustomMode(true)}
                className="w-full justify-start h-8 px-2 text-xs text-muted-foreground"
              >
                <Edit3 className="h-3 w-3 mr-2" />
                Custom status...
              </Button>
            </>
          ) : (
            /* Custom status input */
            <div className="space-y-2">
              <Input
                value={customStatus}
                onChange={(e) => setCustomStatus(e.target.value)}
                placeholder="What's your status?"
                className="h-8 text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCustomStatusSave();
                  } else if (e.key === 'Escape') {
                    setIsCustomMode(false);
                  }
                }}
                autoFocus
              />
              <div className="flex gap-1">
                <Button
                  size="sm"
                  onClick={handleCustomStatusSave}
                  disabled={!customStatus.trim() || updateProfile.isPending}
                  className="h-6 px-2 text-xs flex-1"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsCustomMode(false);
                    setCustomStatus(userProfile?.status_message || '');
                  }}
                  className="h-6 px-2 text-xs"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};