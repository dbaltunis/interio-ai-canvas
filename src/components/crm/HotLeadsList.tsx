import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Calendar, Flame } from "lucide-react";
import { useHotLeads } from "@/hooks/useLeadIntelligence";
import { LeadScoreCard } from "./LeadScoreCard";
import { formatDistanceToNow } from "date-fns";

export const HotLeadsList = () => {
  const { data: hotLeads, isLoading } = useHotLeads();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Hot Leads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!hotLeads?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Hot Leads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">No hot leads at the moment</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Hot Leads ({hotLeads.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hotLeads.map((lead) => (
          <div key={lead.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>
                    {(lead.client_type === 'B2B' ? lead.company_name : lead.name)
                      ?.split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase() || 'CL'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">
                    {lead.client_type === 'B2B' ? lead.company_name : lead.name}
                  </h4>
                  {lead.client_type === 'B2B' && lead.contact_person && (
                    <p className="text-sm text-muted-foreground">{lead.contact_person}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{lead.funnel_stage}</Badge>
                    {lead.lead_source && (
                      <Badge variant="secondary" className="text-xs">
                        {lead.lead_source}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <LeadScoreCard score={lead.lead_score || 0} priority={lead.priority_level} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              {lead.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {lead.email}
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {lead.phone}
                </div>
              )}
              {lead.deal_value && parseFloat(lead.deal_value.toString()) > 0 && (
                <div className="text-green-600 font-medium">
                  Deal Value: ${parseFloat(lead.deal_value.toString()).toLocaleString()}
                </div>
              )}
              {lead.last_activity_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Last activity: {formatDistanceToNow(new Date(lead.last_activity_date), { addSuffix: true })}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Phone className="h-3 w-3 mr-1" />
                Call
              </Button>
              <Button size="sm" variant="outline">
                <Mail className="h-3 w-3 mr-1" />
                Email
              </Button>
              <Button size="sm" variant="outline">
                <Calendar className="h-3 w-3 mr-1" />
                Schedule
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};