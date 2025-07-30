import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useProcessPendingNotifications } from "@/hooks/useProcessNotifications";

export const ProcessNotificationsButton = () => {
  const processNotifications = useProcessPendingNotifications();

  return (
    <Button
      onClick={() => processNotifications.mutate()}
      disabled={processNotifications.isPending}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Send className="h-4 w-4" />
      {processNotifications.isPending ? "Processing..." : "Send Pending Notifications"}
    </Button>
  );
};