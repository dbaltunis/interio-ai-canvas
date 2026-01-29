import { UnifiedNotificationCenter } from "@/components/notifications/UnifiedNotificationCenter";
import { NotificationProvider } from "@/contexts/NotificationContext";

const Notifications = () => {
  return (
    <NotificationProvider>
      <div className="min-h-screen bg-background">
        <UnifiedNotificationCenter />
      </div>
    </NotificationProvider>
  );
};

export default Notifications;
