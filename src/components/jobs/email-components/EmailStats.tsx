
import { Eye, MousePointer, Clock, Calendar } from "lucide-react";

interface Email {
  id: string;
  subject: string;
  content: string;
  recipient_email: string;
  recipient_name?: string;
  status: string;
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  open_count: number;
  click_count: number;
  time_spent_seconds: number;
  bounce_reason?: string;
}

interface EmailStatsProps {
  email: Email;
}

export const EmailStats = ({ email }: EmailStatsProps) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="text-center p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-center mb-1">
          <Eye className={`h-4 w-4 ${email.open_count > 0 ? 'text-blue-600' : 'text-gray-400'}`} />
        </div>
        <div className="text-lg font-semibold">
          {email.open_count}
        </div>
        <div className="text-xs text-gray-600">
          {email.open_count === 0 ? 'Not Opened' : 
           email.open_count === 1 ? 'Opened Once' : 
           'Multiple Opens'}
        </div>
      </div>
      <div className="text-center p-3 bg-gray-50 rounded-lg">
        <MousePointer className="h-4 w-4 mx-auto mb-1 text-primary" />
        <div className="text-lg font-semibold">{email.click_count}</div>
        <div className="text-xs text-gray-600">Clicks</div>
      </div>
      <div className="text-center p-3 bg-gray-50 rounded-lg">
        <Clock className="h-4 w-4 mx-auto mb-1 text-orange-600" />
        <div className="text-lg font-semibold">N/A</div>
        <div className="text-xs text-gray-600">Time Spent*</div>
      </div>
      <div className="text-center p-3 bg-gray-50 rounded-lg">
        <Calendar className="h-4 w-4 mx-auto mb-1 text-green-600" />
        <div className="text-xs font-semibold">
          {email.sent_at ? new Date(email.sent_at).toLocaleDateString() : 'N/A'}
        </div>
        <div className="text-xs text-gray-600">Sent Date</div>
      </div>
    </div>
  );
};
