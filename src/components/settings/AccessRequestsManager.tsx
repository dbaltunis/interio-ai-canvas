import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAccessRequests, useUpdateAccessRequest } from "@/hooks/useAccessRequests";
import { formatDistanceToNow } from "date-fns";
import { Check, X, Clock, User } from "lucide-react";

export const AccessRequestsManager = () => {
  const { data: requests, isLoading } = useAccessRequests();
  const updateRequest = useUpdateAccessRequest();

  const handleApprove = (id: string) => {
    updateRequest.mutate({ id, status: 'approved' });
  };

  const handleReject = (id: string) => {
    updateRequest.mutate({ id, status: 'rejected' });
  };

  if (isLoading) {
    return <div>Loading access requests...</div>;
  }

  const pendingRequests = requests?.filter(r => r.status === 'pending') || [];
  const recentRequests = requests?.slice(0, 10) || [];

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Access Requests
          </CardTitle>
          <CardDescription>
            Requests waiting for your approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <p className="text-muted-foreground">No pending requests</p>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{request.requester?.display_name}</span>
                      <span className="text-muted-foreground">
                        wants to edit {request.record_type}
                      </span>
                    </div>
                    {request.request_reason && (
                      <p className="text-sm text-muted-foreground mb-2">
                        "{request.request_reason}"
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Requested {formatDistanceToNow(new Date(request.created_at))} ago
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(request.id)}
                      disabled={updateRequest.isPending}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(request.id)}
                      disabled={updateRequest.isPending}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Access Requests</CardTitle>
          <CardDescription>
            All recent access requests and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentRequests.length === 0 ? (
            <p className="text-muted-foreground">No recent requests</p>
          ) : (
            <div className="space-y-3">
              {recentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{request.requester?.display_name}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{request.record_type}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(request.created_at))} ago
                    </p>
                  </div>
                  <Badge 
                    variant={
                      request.status === 'approved' ? 'default' :
                      request.status === 'rejected' ? 'destructive' : 'secondary'
                    }
                  >
                    {request.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};