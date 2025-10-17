import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, Mail, Phone, Calendar, FileText, 
  Target, TrendingUp, Users, MessageSquare 
} from "lucide-react";

interface CRMQuickActionsProps {
  onAddClient?: () => void;
  onSendEmail?: () => void;
  onScheduleCall?: () => void;
  onCreateTask?: () => void;
  onCreateQuote?: () => void;
}

export const CRMQuickActions = ({
  onAddClient,
  onSendEmail,
  onScheduleCall,
  onCreateTask,
  onCreateQuote
}: CRMQuickActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        <Button 
          variant="outline" 
          className="justify-start h-auto py-3 px-4"
          onClick={onAddClient}
        >
          <div className="flex flex-col items-start gap-1 w-full">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span className="font-semibold text-sm">Add Client</span>
            </div>
            <span className="text-xs text-muted-foreground">Create new lead</span>
          </div>
        </Button>

        <Button 
          variant="outline" 
          className="justify-start h-auto py-3 px-4"
          onClick={onSendEmail}
        >
          <div className="flex flex-col items-start gap-1 w-full">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="font-semibold text-sm">Send Email</span>
            </div>
            <span className="text-xs text-muted-foreground">Bulk or single</span>
          </div>
        </Button>

        <Button 
          variant="outline" 
          className="justify-start h-auto py-3 px-4"
          onClick={onScheduleCall}
        >
          <div className="flex flex-col items-start gap-1 w-full">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="font-semibold text-sm">Schedule</span>
            </div>
            <span className="text-xs text-muted-foreground">Meeting/Call</span>
          </div>
        </Button>

        <Button 
          variant="outline" 
          className="justify-start h-auto py-3 px-4"
          onClick={onCreateQuote}
        >
          <div className="flex flex-col items-start gap-1 w-full">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="font-semibold text-sm">Create Quote</span>
            </div>
            <span className="text-xs text-muted-foreground">New proposal</span>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
};
